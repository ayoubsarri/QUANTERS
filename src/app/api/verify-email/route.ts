export const dynamic = "force-static";
import { NextRequest, NextResponse } from "next/server";
import {
  verifyEmailWithFailover,
  VerificationProviderKey,
} from "@/lib/utils/emailVerification";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { valid: false, deliverable: false, error: "Missing email parameter" },
      { status: 400 }
    );
  }

  const serverKeys: VerificationProviderKey[] = [];
  if (process.env.ZEROBOUNCE_KEY_1) {
    serverKeys.push({
      provider: "zerobounce",
      key: process.env.ZEROBOUNCE_KEY_1,
      label: "Server ZeroBounce 1",
    });
  }
  if (process.env.ZEROBOUNCE_KEY_2) {
    serverKeys.push({
      provider: "zerobounce",
      key: process.env.ZEROBOUNCE_KEY_2,
      label: "Server ZeroBounce 2",
    });
  }
  if (process.env.ABSTRACT_KEY_1) {
    serverKeys.push({
      provider: "abstract",
      key: process.env.ABSTRACT_KEY_1,
      label: "Server Abstract 1",
    });
  }
  if (process.env.ABSTRACT_KEY_2) {
    serverKeys.push({
      provider: "abstract",
      key: process.env.ABSTRACT_KEY_2,
      label: "Server Abstract 2",
    });
  }

  const result = await verifyEmailWithFailover(email, serverKeys);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { valid: false, deliverable: false, error: "Missing email in JSON body" },
        { status: 400 }
      );
    }

    const serverKeys: VerificationProviderKey[] = [];
    if (process.env.ZEROBOUNCE_KEY_1) {
      serverKeys.push({
        provider: "zerobounce",
        key: process.env.ZEROBOUNCE_KEY_1,
        label: "Server ZeroBounce 1",
      });
    }
    if (process.env.ZEROBOUNCE_KEY_2) {
      serverKeys.push({
        provider: "zerobounce",
        key: process.env.ZEROBOUNCE_KEY_2,
        label: "Server ZeroBounce 2",
      });
    }
    if (process.env.ABSTRACT_KEY_1) {
      serverKeys.push({
        provider: "abstract",
        key: process.env.ABSTRACT_KEY_1,
        label: "Server Abstract 1",
      });
    }
    if (process.env.ABSTRACT_KEY_2) {
      serverKeys.push({
        provider: "abstract",
        key: process.env.ABSTRACT_KEY_2,
        label: "Server Abstract 2",
      });
    }

    const result = await verifyEmailWithFailover(email, serverKeys);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: true, deliverable: true, fallback: true },
      { status: 200 }
    );
  }
}
