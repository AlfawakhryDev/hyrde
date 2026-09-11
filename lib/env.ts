// ── Which deployment this is ─────────────────────────────────────────
// One place that answers "production, preview or development?", so moving
// off Vercel is a configuration change rather than a code change. Vercel sets
// VERCEL_ENV and VERCEL_GIT_COMMIT_SHA itself. Anywhere else (AWS), set
// APP_ENV and APP_RELEASE, plus NEXT_PUBLIC_APP_ENV and
// NEXT_PUBLIC_APP_RELEASE so the browser knows too. The NEXT_PUBLIC_ names
// are written out in full on purpose: Next only inlines a variable into the
// browser bundle when it appears verbatim as process.env.NEXT_PUBLIC_X.
export type AppEnv = "production" | "preview" | "development";

// `||`, not `??`: a variable that is set but empty (a blank `APP_ENV=` line
// copied from .env.example) must fall through, not shadow Vercel's value.
export const appEnv: AppEnv = normalise(
  process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV ||
  process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV,
);

export const appRelease: string | undefined =
  process.env.NEXT_PUBLIC_APP_RELEASE || process.env.APP_RELEASE ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || undefined;

/** True on a real deployment. False on a laptop or in CI. */
export const isDeployed = appEnv !== "development";

// Anything unrecognised is development: never trust a typo into production.
function normalise(v: string | undefined): AppEnv {
  return v === "production" || v === "preview" ? v : "development";
}
