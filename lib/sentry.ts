import { appEnv, appRelease, isDeployed } from "./env";

// ── Sentry: one configuration for server, edge and browser ────────────
// The DSN is public by design: it ships in every browser bundle and lets
// anyone SEND events to the project, nothing more. Block spam in Sentry →
// Project Settings → Allowed Domains.
//
// Only deployed builds report (see lib/env.ts). Local development and CI
// never do: an inbox full of noise is how the real alert gets ignored. No
// PII: no IP addresses, cookies or request bodies.
export const sentryOptions = {
  dsn: "https://5e93ef880fb55755450fbcdae9f578f1@o4512066289139712.ingest.us.sentry.io/4512066295169024",
  enabled: isDeployed,
  environment: appEnv,
  release: appRelease,
  sendDefaultPii: false,
};
