import { NextRequest, NextResponse } from "next/server";
import { sendEmail, FROM_EMAIL, FROM_NAME } from "@/lib/email";

export const dynamic = "force-dynamic";

// ── Prove email actually works ───────────────────────────────────────
// Gated on CRON_SECRET rather than a user session, so the send can be
// triggered from a terminal during setup, before any of the notification
// paths that depend on it exist.
//
// It reports exactly what SendGrid said, because the first send almost always
// fails on sender verification rather than on the key, and "it didn't arrive"
// is not something anyone can debug.
//
//   GET  -> configuration check, sends nothing
//   POST -> sends one real email to `to`
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (auth.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < auth.length; i++) diff |= auth.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const key = process.env.SENDGRID_API_KEY ?? "";
  return NextResponse.json({
    keyPresent: key.length > 0,
    keyLength: key.length,
    looksLikeSendGridKey: key.startsWith("SG."),
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    note: "The From address must be a verified Sender Identity in SendGrid, or every send returns 403.",
  });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const to = String(body?.to ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Give a valid `to` address." }, { status: 400 });
  }

  const stamp = new Date().toUTCString();
  const result = await sendEmail({
    to,
    subject: "Hyrde email is working",
    text: [
      "This is a test from Hyrde.",
      "",
      "If you are reading this, SendGrid is wired up and the platform can start sending:",
      "  - call requests and confirmations",
      "  - milestone progress updates",
      "  - shortlist and selection notices",
      "",
      `Sent ${stamp} from ${FROM_EMAIL}.`,
    ].join("\n"),
    html: `<div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.6;color:#15181D">
  <p style="margin:0 0 14px"><strong>This is a test from Hyrde.</strong></p>
  <p style="margin:0 0 14px">If you are reading this, SendGrid is wired up and the platform can start sending call requests, milestone progress updates, and shortlist notices.</p>
  <p style="margin:0;color:#565D68;font-size:13px">Sent ${stamp} from ${FROM_EMAIL}.</p>
</div>`,
  });

  return NextResponse.json({ to, ...result }, { status: result.ok ? 200 : 502 });
}
