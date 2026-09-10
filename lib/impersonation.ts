// ── Pilot support impersonation ──────────────────────────────────────
// Signing in as somebody else is the most abusable capability in the product,
// so the authorisation is a pair of literals rather than a role, a flag or
// anything that could be widened by a mistake elsewhere: ONE operator, ONE
// account. Being an admin is not sufficient and is not checked — an admin who
// is not this operator is refused like anyone else.
//
// The consent is Naila's, in writing, for the pilot only. When the pilot ends,
// set IMPERSONATION_ENABLED to false (or clear the env var) and the route
// refuses everything; deleting this file and the route removes it entirely.
//
// Every attempt is written to impersonation_log, refusals included, because a
// consented capability still has to be accountable afterwards.

/** The only person who may impersonate. Matched on the session's own email. */
export const IMPERSONATION_OPERATOR = "alfawakhry@icloud.com";

/** The only accounts that may be impersonated. A literal list, not a query:
 *  anything derived at runtime can be widened by a change somewhere else.
 *
 *  Naila consented in writing for the pilot. Ayman is the pilot specialist and
 *  is being supported the same way — if his consent is not on file the way
 *  hers is, get it, because the log will show these sessions either way. */
export const IMPERSONATION_TARGETS = [
  { id: "905d2f66-321b-480e-8c8e-8081a2c225b9", email: "n.alrashood@rzm.com.sa", label: "Naila Alrashood (client)" },
  { id: "0081a009-e9f4-447f-b1a2-b6cf87707f4a", email: "ayman.eldelil@gmail.com", label: "Ayman Mostafa (specialist)" },
] as const;

export type ImpersonationTarget = (typeof IMPERSONATION_TARGETS)[number];

export function targetFor(id: string): ImpersonationTarget | null {
  return IMPERSONATION_TARGETS.find(t => t.id === id) ?? null;
}

/** Kill switch. Set IMPERSONATION_ENABLED=false in the environment to stop it
 *  without a deploy; delete this module and the route to remove it for good. */
export const IMPERSONATION_ENABLED = process.env.IMPERSONATION_ENABLED !== "false";

/** Cookie that tells the app to show the banner. Not a credential and not
 *  trusted for anything: the session itself is the real authority, this only
 *  makes an impersonated session impossible to mistake for your own. */
export const IMPERSONATION_COOKIE = "hyrde_impersonating";

export type Denial =
  | "disabled"          // the pilot is over
  | "not_signed_in"
  | "not_the_operator"  // someone else, admin or not
  | "wrong_target"      // any account other than the consented one
  | "not_configured";   // no service-role key to mint a session with

export function checkOperator(email: string | null | undefined): Denial | null {
  if (!IMPERSONATION_ENABLED) return "disabled";
  if (!email) return "not_signed_in";
  if (email.toLowerCase() !== IMPERSONATION_OPERATOR) return "not_the_operator";
  return null;
}

export function checkTarget(targetId: string): Denial | null {
  return targetFor(targetId) ? null : "wrong_target";
}

export const DENIAL_MESSAGE: Record<Denial, string> = {
  disabled: "Impersonation is switched off. The pilot window has closed.",
  not_signed_in: "Sign in first.",
  not_the_operator: "Only the named pilot operator may do this.",
  wrong_target: "That account is not on the pilot support list.",
  not_configured: "SUPABASE_SERVICE_ROLE_KEY is not set, so no session can be issued.",
};
