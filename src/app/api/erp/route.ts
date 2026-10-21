import { NextRequest, NextResponse } from "next/server";
import { readErpDatabase, writeErpDatabase } from "@/lib/server/db";

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
    const body = await req.json();
    const updated = writeErpDatabase(body.data || body);
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
