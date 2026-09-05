// ── Sending mail through SendGrid ────────────────────────────────────
// One place that talks to SendGrid, so every email in the product shares the
// same sender, the same failure handling, and the same "did it actually go"
// answer. Uses the REST API over fetch rather than @sendgrid/mail: it is one
// POST, and a dependency that wraps one POST is a dependency to keep updated.
//
// Nothing here throws. A failed email must never break the thing that
// triggered it, so callers get {ok:false, ...} and decide. That was already
// the rule for the Postgres notify triggers and it stays the rule here.

const ENDPOINT = "https://api.sendgrid.com/v3/mail/send";

/** Must be a verified Sender Identity in SendGrid, or every send 403s. */
export const FROM_EMAIL = process.env.SENDGRID_FROM ?? "notifications@hyrde.net";
export const FROM_NAME = process.env.SENDGRID_FROM_NAME ?? "Hyrde";
export const REPLY_TO = process.env.SENDGRID_REPLY_TO ?? "abdelrahman@hyrde.net";

export type SendResult =
  | { ok: true; status: number }
  | { ok: false; status: number; error: string; hint?: string };

/** Turn SendGrid's most common rejections into something actionable. */
function explain(status: number, body: string): { error: string; hint?: string } {
  if (status === 401) {
    return { error: "SendGrid rejected the API key.", hint: "SENDGRID_API_KEY is missing, revoked, or lacks Mail Send permission." };
  }
  if (status === 403) {
    return {
      error: "SendGrid refused the sender address.",
      hint: `"${FROM_EMAIL}" is not a verified Sender Identity. Verify that address, or authenticate the hyrde.net domain, in SendGrid under Settings > Sender Authentication.`,
    };
  }
  if (status === 413) return { error: "The email was too large for SendGrid." };
  return { error: body.slice(0, 400) || `SendGrid returned ${status}.` };
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  /** Optional. SendGrid wants text/plain before text/html, and we always send both. */
  html?: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    return {
      ok: false,
      status: 0,
      error: "SENDGRID_API_KEY is not set.",
      hint: "Add it to the Vercel project environment and redeploy. Until then every email silently does nothing.",
    };
  }

  const content: { type: string; value: string }[] = [{ type: "text/plain", value: opts.text }];
  if (opts.html) content.push({ type: "text/html", value: opts.html });

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: opts.to }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email: opts.replyTo ?? REPLY_TO },
        subject: opts.subject,
        content,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    // A successful send is 202 with an empty body; everything else carries JSON.
    if (res.status === 202) return { ok: true, status: 202 };
    return { ok: false, status: res.status, ...explain(res.status, await res.text()) };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : "Could not reach SendGrid." };
  }
}
