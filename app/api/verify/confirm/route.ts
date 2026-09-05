import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { hashCode } from "@/lib/verify";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  invalid:  "That code is not right. Check it and try again.",
  expired:  "That code has expired. Send yourself a new one.",
  too_many: "Too many attempts. Send yourself a new code.",
  none:     "No code is waiting. Send yourself a new one.",
};

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = String(body?.code ?? "").replace(/\D/g, "");
  if (code.length !== 6) return NextResponse.json({ error: "Enter the six digit code." }, { status: 400 });

  // The database compares digests; the plaintext code never leaves this route.
  const { data, error } = await supabase.rpc("consume_email_code", {
    p_code_hash: hashCode(code, user.id),
  });
  if (error) return NextResponse.json({ error: "Could not check that code." }, { status: 500 });

  const result = String(data);
  if (result === "ok") return NextResponse.json({ verified: true });
  return NextResponse.json({ verified: false, reason: result, error: MESSAGES[result] ?? "Could not verify that code." }, { status: 400 });
}
