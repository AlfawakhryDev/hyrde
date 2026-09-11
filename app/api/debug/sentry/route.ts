import { NextResponse } from "next/server";
import { appEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

// Proves error tracking end to end on a PREVIEW deployment: request this and
// the error should appear in Sentry under environment "preview". Production
// answers 404, so it cannot be used to fill the error inbox with noise.
export async function GET() {
  if (appEnv === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  throw new Error(`Sentry smoke test (${appEnv}) at ${new Date().toISOString()}`);
}
