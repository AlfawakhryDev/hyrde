import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { guardAi } from "@/lib/ratelimit";
import { auditSite, findUrl } from "@/lib/siteaudit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ── Read a client's existing site, on the fly ────────────────────────────────
// "redo our website: https://rzm.com.sa/ar/" — we fetch the page and return the
// facts that change the plan (platform, language/direction, size, gaps) so the
// scoping step works from evidence instead of a guess.
//
// Login-gated + rate-limited: this makes the server fetch a user-supplied URL,
// so it must not be an open proxy. lib/siteaudit re-validates every redirect
// hop against private/loopback/metadata ranges.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const raw = String(body?.url ?? "").trim();
  const target = raw.startsWith("http") ? raw : findUrl(raw);
  if (!target) return NextResponse.json({ error: "No URL found in that." }, { status: 400 });

  try {
    const context = await auditSite(target);
    if (!context.ok) {
      return NextResponse.json({ error: `That site returned ${context.status}.` }, { status: 422 });
    }
    return NextResponse.json({ context });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read that site.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
