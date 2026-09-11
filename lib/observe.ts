// ── Failures that must not be silent ─────────────────────────────────
// Every serious bug this codebase has had reported success while doing
// nothing: leads that never saved, notifications against an empty Vault, a
// swallowed 429 that looked like a feature. This is where a caught failure
// goes to be seen.
//
// One line of JSON per failure, so Vercel's log search and any log drain
// (Axiom, Datadog, Better Stack) can alert on "level":"error" with no parser.
// ponytail: stdout only. When there is an error tracker (Sentry), forward from
// here too; call sites do not change.
type Extra = Record<string, string | number | boolean | undefined | null>;

export function reportError(where: string, err: unknown, extra: Extra = {}): void {
  const o = typeof err === "object" && err !== null ? (err as Record<string, unknown>) : null;
  const line = {
    level: "error",
    where,
    message: err instanceof Error ? err.message : o && "message" in o ? String(o.message) : String(err),
    // PostgREST errors are plain objects carrying a SQLSTATE code, not Errors.
    code: o && "code" in o ? String(o.code) : undefined,
    stack: err instanceof Error ? err.stack?.split("\n").slice(0, 6).join("\n") : undefined,
    ...extra,
    at: new Date().toISOString(),
  };
  try {
    console.error(JSON.stringify(line));
  } catch {
    console.error(`[${where}]`, err); // an unserialisable value must not hide the failure
  }
}
