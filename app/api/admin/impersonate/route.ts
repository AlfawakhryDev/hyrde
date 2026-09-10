import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import {
  IMPERSONATION_TARGETS, IMPERSONATION_COOKIE,
  checkOperator, checkTarget, targetFor, DENIAL_MESSAGE, type Denial,
} from "@/lib/impersonation";

export const dynamic = "force-dynamic";

// ── Issue a support session as the consented pilot account ───────────
// Identity comes from the caller's own session, never from the request body:
// a route that trusts a posted operator id is a route anyone can call.
//
// The refusal path logs too. A record that only contains successes cannot
// answer the question you actually ask it later, which is whether anyone tried.

async function record(
  operatorId: string | null, operatorEmail: string,
  targetId: string, targetEmail: string,
  allowed: boolean, reason: string, req: NextRequest,
) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return;                 // nothing to log with; never throw
    await createClient(url, key, { auth: { persistSession: false } })
      .rpc("log_impersonation", {
        p_operator: operatorId,
        p_operator_email: operatorEmail,
        p_target: targetId,
        p_target_email: targetEmail,
        p_allowed: allowed,
        p_reason: reason.slice(0, 300),
        p_ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        p_ua: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      });
  } catch (err) {
    console.error("impersonation log failed:", err);
  }
}

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? "";

  const body = await req.json().catch(() => ({}));
  const targetId = String(body?.targetId ?? "");
  const purpose = String(body?.purpose ?? "").slice(0, 300);

  const denial: Denial | null = checkOperator(email) ?? checkTarget(targetId);
  if (denial) {
    const t = targetFor(targetId);
    await record(user?.id ?? null, email || "(anonymous)",
                 t?.id ?? targetId, t?.email ?? "(not on the list)", false, denial, req);
    // Deliberately the same status for every refusal: telling an attacker
    // which of the two conditions they failed is telling them something.
    return NextResponse.json({ error: DENIAL_MESSAGE[denial] }, { status: 403 });
  }

  const target = targetFor(targetId)!;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    await record(user!.id, email, target.id, target.email, false, "not_configured", req);
    return NextResponse.json({ error: DENIAL_MESSAGE.not_configured }, { status: 501 });
  }

  // A one-time magic link, minted server side. The service key never leaves
  // this function and is never sent to the browser.
  //
  // generateLink() GENERATES; it does not send. Never swap it for
  // signInWithOtp() or admin.inviteUserByEmail() — those mail the target, and
  // the whole point is that the pilot accounts are never told this happened.
  let actionLink: string;
  try {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: target.email,
    });
    if (error || !data?.properties?.hashed_token) {
      throw new Error(error?.message ?? "no hashed_token returned");
    }
    // NOT data.properties.action_link. That points at Supabase's own verify
    // endpoint, which comes back as ?code= — a PKCE code that can only be
    // exchanged by the browser that STARTED the flow. Nothing started this
    // one, and a private window has no verifier, so following it signs you in
    // nowhere and dumps you on /login?error=auth.
    //
    // The hashed token has no such requirement: our callback verifies it
    // server-side and sets the session cookie on whichever window opens it.
    const q = new URLSearchParams({
      token_hash: data.properties.hashed_token,
      type: "magiclink",
      next: "/dashboard",
      support: "1",          // tells the callback to raise the banner
    });
    actionLink = `${req.nextUrl.origin}/auth/callback?${q}`;
  } catch (err) {
    console.error("impersonation link failed:", err);
    await record(user!.id, email, target.id, target.email, false, "link_failed", req);
    return NextResponse.json({ error: "Could not issue a session." }, { status: 502 });
  }

  // Go quiet before the session starts, not after: a notification fired in
  // the first seconds is exactly the one that would need explaining. Expires
  // on its own after four hours so a forgotten session doesn't mute someone
  // indefinitely.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  await admin.rpc("start_support_session", { p_target: target.id, p_by: user!.id })
    .then(({ error }) => error && console.error("support session:", error.message));

  await record(user!.id, email, target.id, target.email, true, purpose || "(no purpose given)", req);

  const res = NextResponse.json({ actionLink, target: target.email });
  // Marks the session that follows as borrowed, so the banner shows. Not
  // httpOnly on purpose: the banner is client-rendered and this carries no
  // authority — the session cookie is what actually grants anything.
  res.cookies.set(IMPERSONATION_COOKIE, target.email, {
    path: "/", sameSite: "lax", maxAge: 60 * 60 * 4, httpOnly: false,
  });
  return res;
}

export async function GET() {
  // The admin page asks what it may offer; it never decides that itself.
  return NextResponse.json({
    targets: IMPERSONATION_TARGETS.map(t => ({ id: t.id, label: t.label })),
  });
}

// Ending it clears the marker and lets notifications flow again. Signing out
// ends the borrowed session itself.
export async function DELETE() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const target = targetFor(user?.id ?? "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (target && url && key) {
    await createClient(url, key, { auth: { persistSession: false } })
      .rpc("end_support_session", { p_target: target.id })
      .then(({ error }) => error && console.error("support session:", error.message));
  }

  const res = NextResponse.json({ ended: true });
  res.cookies.set(IMPERSONATION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
