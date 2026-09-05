import { createHash, randomInt, timingSafeEqual } from "node:crypto";

// ── Email verification codes ─────────────────────────────────────────
// Six digits, ten minutes, five attempts. Only the digest is ever stored or
// transmitted to the database, so a leaked row, backup or log line does not
// hand anybody a working code.

export const CODE_TTL_MINUTES = 10;

/** Cryptographically random, never Math.random for anything that guards access. */
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Salted with the user id so the same code for two people hashes differently. */
export function hashCode(code: string, userId: string): string {
  return createHash("sha256").update(`${code}:${userId}`).digest("hex");
}

/** Constant time, so a wrong code cannot be narrowed down by timing. */
export function codesMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function verificationEmail(code: string) {
  return {
    subject: `${code} is your Hyrde verification code`,
    text: [
      `Your Hyrde verification code is ${code}.`,
      "",
      `It expires in ${CODE_TTL_MINUTES} minutes.`,
      "",
      "If you did not ask to verify an email address, you can ignore this. Nobody can use the code without access to your account.",
    ].join("\n"),
    html: `<div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.6;color:#15181D">
  <p style="margin:0 0 10px">Your Hyrde verification code is</p>
  <p style="margin:0 0 14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:30px;font-weight:600;letter-spacing:.16em">${code}</p>
  <p style="margin:0 0 14px;color:#565D68">It expires in ${CODE_TTL_MINUTES} minutes.</p>
  <p style="margin:0;color:#868D99;font-size:13px">If you did not ask to verify an email address, you can ignore this. Nobody can use the code without access to your account.</p>
</div>`,
  };
}
