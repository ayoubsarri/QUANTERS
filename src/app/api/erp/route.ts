import { NextRequest, NextResponse } from "next/server";
import { readErpDatabase, writeErpDatabase } from "@/lib/server/db";

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB strict payload ceiling

export async function GET() {
  const { snapshot, telemetry } = readErpDatabase();
  return NextResponse.json({
    ok: true,
    telemetry,
    data: snapshot,
  });
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
    return NextResponse.json({
      ok: true,
      telemetry,
      updatedAt: updated.updatedAt,
    });
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
