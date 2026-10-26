import { NextRequest, NextResponse } from "next/server";
import {
  computeDeltaErpDatabase,
  readErpDatabase,
  writeErpDatabase,
} from "@/lib/server/db";

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB strict payload ceiling
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window
const RATE_LIMIT_MAX_WRITES = 60; // max 60 state writes per minute per IP

const writeRateMap = new Map<string, { count: number; resetAt: number }>();

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function hasPrototypePollutionKeys(value: unknown, depth = 0): boolean {
  if (depth > 12 || !value || typeof value !== "object") return false;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (hasPrototypePollutionKeys(value[i], depth + 1)) return true;
    }
    return false;
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (FORBIDDEN_KEYS.has(key)) return true;
    if (hasPrototypePollutionKeys(record[key], depth + 1)) return true;
  }
  return false;
}

function checkRateLimit(clientKey: string): boolean {
  const now = Date.now();
  const entry = writeRateMap.get(clientKey);
  if (!entry || now > entry.resetAt) {
    writeRateMap.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= RATE_LIMIT_MAX_WRITES;
}

function computeQuotaTelemetry(
  baseTelemetry: ReturnType<typeof readErpDatabase>["telemetry"],
  preset: "standard" | "aggressive" | "ultra" = "aggressive"
) {
  // Firebase Spark Free-Tier Limits: 50,000 reads/day, 20,000 writes/day
  const readsPerUser = preset === "ultra" ? 2 : preset === "aggressive" ? 5 : 40;
  const writesPerUser = preset === "ultra" ? 1 : preset === "aggressive" ? 3 : 18;
  const maxByReads = Math.floor(50000 / readsPerUser);
  const maxByWrites = Math.floor(20000 / writesPerUser);
  const firebaseSparkMaxUsers = Math.min(maxByReads, maxByWrites);
  const quotaReductionPercent =
    preset === "ultra" ? 96 : preset === "aggressive" ? 90 : 0;

  return {
    ...baseTelemetry,
    preset,
    estimatedDailyReadsPerUser: readsPerUser,
    estimatedDailyWritesPerUser: writesPerUser,
    firebaseSparkMaxUsers,
    quotaReductionPercent,
  };
}

export async function GET(req: NextRequest) {
  const { snapshot, telemetry } = readErpDatabase();
  const etag = `W/"${snapshot.updatedAt}-${telemetry.dbSizeBytes}"`;
  const ifNoneMatch = req.headers.get("if-none-match");
  const sinceParam = req.nextUrl.searchParams.get("since");
  const versionsParam = req.nextUrl.searchParams.get("versions");

  if (
    (ifNoneMatch && ifNoneMatch === etag) ||
    (sinceParam && sinceParam === snapshot.updatedAt)
  ) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "private, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const enrichedTelemetry = computeQuotaTelemetry(
    telemetry,
    snapshot.settings.quotaSaverPreset || "aggressive"
  );

  // If client sends known `versions`, return ONLY the exact collections that changed
  if (versionsParam) {
    try {
      const clientVersions = JSON.parse(versionsParam) as Record<string, string>;
      const { changedKeys, delta, collectionVersions, updatedAt } =
        computeDeltaErpDatabase(clientVersions);

      if (changedKeys.length === 0) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: etag,
            "Cache-Control": "private, max-age=0, must-revalidate",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      return NextResponse.json(
        {
          ok: true,
          isDelta: true,
          etag,
          updatedAt,
          changedKeys,
          collectionVersions,
          telemetry: enrichedTelemetry,
          delta,
        },
        {
          headers: {
            ETag: etag,
            "Cache-Control": "private, max-age=0, must-revalidate",
            "X-Content-Type-Options": "nosniff",
          },
        }
      );
    } catch {
      // Fallback to full snapshot if versions param was malformed
    }
  }

  return NextResponse.json(
    {
      ok: true,
      isDelta: false,
      etag,
      updatedAt: snapshot.updatedAt,
      collectionVersions: snapshot.collectionVersions,
      telemetry: enrichedTelemetry,
      data: snapshot,
    },
    {
      headers: {
        ETag: etag,
        "Cache-Control": "private, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Sliding-Window Rate Limiting per IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "local";
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          type: "https://quanters.quanta.dz/problems/rate-limit-exceeded",
          title: "Too Many Requests",
          status: 429,
          detail: "Rate limit exceeded for state mutations. Please wait a moment.",
        },
        { status: 429 }
      );
    }

    // 2. Cross-Site Request Forgery (CSRF) Fetch Metadata & Origin Defense
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (secFetchSite && secFetchSite === "cross-site") {
      return NextResponse.json(
        {
          type: "https://quanters.quanta.dz/problems/forbidden-origin",
          title: "Cross-site state mutation forbidden",
          status: 403,
          detail: "Cross-site POST requests to /api/erp are blocked by security policy.",
        },
        { status: 403 }
      );
    }

    const originHeader = req.headers.get("origin");
    const hostHeader = req.headers.get("host");
    if (originHeader && hostHeader) {
      try {
        const originHost = new URL(originHeader).host;
        if (originHost !== hostHeader) {
          return NextResponse.json(
            {
              type: "https://quanters.quanta.dz/problems/origin-mismatch",
              title: "Origin Mismatch",
              status: 403,
              detail: "Request Origin header does not match Host.",
            },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          {
            type: "https://quanters.quanta.dz/problems/invalid-origin",
            title: "Malformed Origin Header",
            status: 403,
            detail: "Invalid Origin header.",
          },
          { status: 403 }
        );
      }
    }

    // 3. Content-Type Validation
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        {
          type: "https://quanters.quanta.dz/problems/unsupported-media-type",
          title: "Unsupported Content-Type",
          status: 415,
          detail: "Expected Content-Type: application/json.",
        },
        { status: 415 }
      );
    }

    // 4. Payload Size Limit (DoS Protection)
    const rawBody = await req.text();
    const byteLength = Buffer.byteLength(rawBody, "utf-8");
    if (byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        {
          type: "https://quanters.quanta.dz/problems/payload-too-large",
          title: "Payload Too Large",
          status: 413,
          detail: `Request body (${byteLength} bytes) exceeds 2 MB limit.`,
        },
        { status: 413 }
      );
    }

    // 5. Deep Prototype Pollution Guard
    if (
      rawBody.includes('"__proto__"') ||
      rawBody.includes('"constructor"') ||
      rawBody.includes('"prototype"')
    ) {
      const parsedCheck = JSON.parse(rawBody);
      if (hasPrototypePollutionKeys(parsedCheck)) {
        return NextResponse.json(
          {
            type: "https://quanters.quanta.dz/problems/invalid-payload",
            title: "Forbidden Prototype Key",
            status: 400,
            detail: "Payload contains forbidden prototype pollution keys.",
          },
          { status: 400 }
        );
      }
    }

    const body = JSON.parse(rawBody);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          type: "https://quanters.quanta.dz/problems/invalid-payload",
          title: "Malformed JSON Object",
          status: 400,
          detail: "Request body must be a valid JSON object.",
        },
        { status: 400 }
      );
    }

    const payload = body.data && typeof body.data === "object" ? body.data : {};
    const itemDeltas =
      body.itemDeltas && typeof body.itemDeltas === "object"
        ? body.itemDeltas
        : undefined;
    const clientVersions =
      body.clientVersions && typeof body.clientVersions === "object"
        ? (body.clientVersions as Record<string, string>)
        : undefined;

    const { snapshot: updated, changedKeys } = writeErpDatabase(payload, itemDeltas);
    const { telemetry } = readErpDatabase();
    const etag = `W/"${updated.updatedAt}-${telemetry.dbSizeBytes}"`;
    const enrichedTelemetry = computeQuotaTelemetry(
      telemetry,
      updated.settings.quotaSaverPreset || "aggressive"
    );

    // Compute any server-side updates that occurred in other collections unknown to client
    let serverDelta: Record<string, unknown> | undefined;
    if (clientVersions) {
      const mergedClientVersions = { ...clientVersions };
      for (const k of changedKeys) {
        if (updated.collectionVersions?.[k]) {
          mergedClientVersions[k] = updated.collectionVersions[k];
        }
      }
      const diff = computeDeltaErpDatabase(mergedClientVersions);
      if (diff.changedKeys.length > 0) {
        serverDelta = diff.delta as Record<string, unknown>;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        etag,
        updatedAt: updated.updatedAt,
        changedKeys,
        collectionVersions: updated.collectionVersions,
        serverDelta,
        telemetry: enrichedTelemetry,
      },
      {
        headers: {
          ETag: etag,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        type: "https://quanters.quanta.dz/problems/sync-failed",
        title: "Failed to persist ERP state",
        status: 400,
        detail: err instanceof Error ? err.message : "Invalid payload",
      },
      { status: 400 }
    );
  }
}
