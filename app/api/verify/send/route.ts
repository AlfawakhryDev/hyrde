import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { generateCode, hashCode, verificationEmail, CODE_TTL_MINUTES } from "@/lib/verify";

export const dynamic = "force-dynamic";

// Sends a verification code to the signed-in user's own address. The address
// is taken from the session, never from the request body, so this cannot be
// used to mail arbitrary people.
export async function POST(_req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const code = generateCode();
  const { error: rpcErr } = await supabase.rpc("issue_email_code", {
    p_code_hash: hashCode(code, user.id),
    p_email: user.email,
    p_ttl_minutes: CODE_TTL_MINUTES,
  });
  if (rpcErr) return NextResponse.json({ error: "Could not start verification." }, { status: 500 });

  const mail = verificationEmail(code);
  const sent = await sendEmail({ to: user.email, ...mail });
  if (!sent.ok) {
    // Say plainly that the mail failed rather than leaving someone waiting for
    // a code that was never sent.
    console.error("Verification email failed:", sent);
    return NextResponse.json({ error: "We could not send the email. Try again shortly." }, { status: 502 });
  }

  return NextResponse.json({ sent: true, to: user.email, expiresInMinutes: CODE_TTL_MINUTES });
}
