import * as Sentry from "@sentry/nextjs";

// ── Failures that must not be silent ─────────────────────────────────
// Every serious bug this codebase has had reported success while doing
// nothing: leads that never saved, notifications against an empty Vault, a
// swallowed 429 that looked like a feature. This is where a caught failure
// goes to be seen.
//
// Two destinations. One line of JSON per failure, so Vercel's log search and
// any log drain can filter on "level":"error" with no parser. And Sentry,
// which groups repeats and alerts, so nobody has to go looking.
type Extra = Record<string, string | number | boolean | undefined | null>;

function describe(err: unknown) {
  const o = typeof err === "object" && err !== null ? (err as Record<string, unknown>) : null;
  return {
    message: err instanceof Error ? err.message : o && "message" in o ? String(o.message) : String(err),
    // PostgREST errors are plain objects carrying a SQLSTATE code, not Errors.
    code: o && "code" in o ? String(o.code) : undefined,
    stack: err instanceof Error ? err.stack?.split("\n").slice(0, 6).join("\n") : undefined,
  };
}

/** One structured log line. Used where Sentry already has the error. */
export function logError(where: string, err: unknown, extra: Extra = {}): void {
  const line = { level: "error", where, ...describe(err), ...extra, at: new Date().toISOString() };
  try {
    console.error(JSON.stringify(line));
  } catch {
    console.error(`[${where}]`, err); // an unserialisable value must not hide the failure
  }
}

/** A caught failure: logged, and sent to Sentry to be grouped and alerted on. */
export function reportError(where: string, err: unknown, extra: Extra = {}): void {
  logError(where, err, extra);
  const { message, code } = describe(err);
  // Sentry groups Errors well and plain objects badly, so a Supabase error is
  // wrapped rather than sent as "Object captured as exception".
  const exception = err instanceof Error ? err : new Error(`${where}: ${message}`);
  try {
    Sentry.captureException(exception, { tags: { where, ...(code ? { code } : {}) }, extra });
  } catch {
    // The log line above has already recorded it; reporting must never throw.
  }
}
