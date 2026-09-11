import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Proves error tracking end to end on a PREVIEW deployment: request this and
// the error should appear in Sentry under environment "preview". Production
// answers 404, so it cannot be used to fill the error inbox with noise.
export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  throw new Error(`Sentry smoke test (${process.env.VERCEL_ENV ?? "local"}) at ${new Date().toISOString()}`);
}
