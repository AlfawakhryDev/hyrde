// ── Sentry: one configuration for server, edge and browser ────────────
// The DSN is public by design: it ships in every browser bundle and lets
// anyone SEND events to the project, nothing more. Block spam in Sentry →
// Project Settings → Allowed Domains.
//
// Only deployed builds report. Local development and CI never do: an inbox
// full of noise is how the real alert gets ignored. No PII: no IP addresses,
// cookies or request bodies.
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;

export const sentryOptions = {
  dsn: "https://5e93ef880fb55755450fbcdae9f578f1@o4512066289139712.ingest.us.sentry.io/4512066295169024",
  enabled: Boolean(vercelEnv),
  environment: vercelEnv ?? "development",       // production | preview
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA,
  sendDefaultPii: false,
};
