// ── Pilot staffing lock ──────────────────────────────────────────────
// During the pilot, every client is put in front of exactly one specialist.
// One person means one quality bar to hold and one relationship to manage
// while the delivery flow is still being proven end to end. It is a temporary
// business rule, not an algorithm change, so it lives in one place that every
// matching path reads — no route can quietly miss it, and switching it off is
// one env var.
//
// Set PILOT_SPECIALIST_ID to "" (or delete it) to return to real matching.
//
// NOTE: this deliberately bypasses the vetting filter. The pinned specialist
// need not have passed an interview, so nothing in the client-facing copy may
// call them "vetted" while the lock is on — see suggest-specialists.
export const PILOT_SPECIALIST_ID =
  process.env.PILOT_SPECIALIST_ID ?? "0081a009-e9f4-447f-b1a2-b6cf87707f4a";

export function pilotLocked(): boolean {
  return PILOT_SPECIALIST_ID.length > 0;
}
