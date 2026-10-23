import { NextRequest, NextResponse } from "next/server";
import { readErpDatabase, writeErpDatabase } from "@/lib/server/db";

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB strict payload ceiling

function computeQuotaTelemetry(
  baseTelemetry: ReturnType<typeof readErpDatabase>["telemetry"],
  preset: "standard" | "aggressive" | "ultra" = "aggressive"
) {
  // Firebase Spark Free-Tier Limits: 50,000 reads/day, 20,000 writes/day
  const readsPerUser = preset === "ultra" ? 4 : preset === "aggressive" ? 10 : 65;
  const writesPerUser = preset === "ultra" ? 2 : preset === "aggressive" ? 5 : 28;
  const maxByReads = Math.floor(50000 / readsPerUser);
  const maxByWrites = Math.floor(20000 / writesPerUser);
  const firebaseSparkMaxUsers = Math.min(maxByReads, maxByWrites);
  const quotaReductionPercent =
    preset === "ultra" ? 94 : preset === "aggressive" ? 85 : 0;

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

  if (
    (ifNoneMatch && ifNoneMatch === etag) ||
    (sinceParam && sinceParam === snapshot.updatedAt)
  ) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  }

  const enrichedTelemetry = computeQuotaTelemetry(
    telemetry,
    snapshot.settings.quotaSaverPreset || "aggressive"
  );

  return NextResponse.json(
    {
      ok: true,
      etag,
      telemetry: enrichedTelemetry,
      data: snapshot,
    },
    {
      headers: {
        ETag: etag,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Cross-Site Request Forgery (CSRF) Fetch Metadata Defense
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

    // 2. Content-Type Validation
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

    // 3. Payload Size Limit (DoS Protection)
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

    // 4. Prototype Pollution Key Guard
    if (rawBody.includes('"__proto__"')) {
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

    const payload = body.data && typeof body.data === "object" ? body.data : body;
    const updated = writeErpDatabase(payload);
    const { telemetry } = readErpDatabase();
    const etag = `W/"${updated.updatedAt}-${telemetry.dbSizeBytes}"`;
    const enrichedTelemetry = computeQuotaTelemetry(
      telemetry,
      updated.settings.quotaSaverPreset || "aggressive"
    );

    return NextResponse.json(
      {
        ok: true,
        etag,
        telemetry: enrichedTelemetry,
        updatedAt: updated.updatedAt,
      },
      {
        headers: {
          ETag: etag,
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
