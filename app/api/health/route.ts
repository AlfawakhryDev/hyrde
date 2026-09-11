import { NextResponse } from "next/server";
import { appRelease } from "@/lib/env";

export const dynamic = "force-dynamic";

// For uptime monitors and post-deploy smoke checks: is the app serving, can it
// reach the database's auth service, and which commit is live. It says nothing
// about configuration, on purpose.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let db: "up" | "down" | "unconfigured" = "unconfigured";
  if (url && key) {
    try {
      const r = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: key },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      db = r.ok ? "up" : "down";
    } catch {
      db = "down"; // unreachable or timed out; the 503 below is the report
    }
  }
  const ok = db === "up";
  return NextResponse.json(
    { ok, db, commit: appRelease?.slice(0, 7) ?? "local" },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
