// Run: npx tsx lib/verified.test.ts
// Guards the case that actually broke: an OAuth account whose
// app_metadata.provider was missing got defaulted to "email" and sent to
// the confirm-your-email wall.
import { isEmailVerified as v } from "./verified";
const cases: [string, boolean, boolean][] = [
  // [name, actual, expected]
  ["google signup, no code",              v({ app_metadata: { provider: "google", providers: ["google"] }, identities: [{ provider: "google" }] }, null), true],
  ["github signup, no code",              v({ app_metadata: { provider: "github", providers: ["github"] } }, null), true],
  ["linkedin signup, no code",            v({ app_metadata: { provider: "linkedin_oidc" } }, null), true],
  ["OAUTH BUT provider undefined (bug)",  v({ app_metadata: {} }, null), true],
  ["no app_metadata at all",              v({}, null), true],
  ["null user",                           v(null, null), true],
  ["signed up email, later linked google", v({ app_metadata: { provider: "email", providers: ["email","google"] } }, null), true],
  ["identity says google, metadata email", v({ app_metadata: { provider: "email" }, identities: [{ provider: "google" }] }, null), true],
  ["password signup, unconfirmed",        v({ app_metadata: { provider: "email", providers: ["email"] }, identities: [{ provider: "email" }] }, null), false],
  ["password signup, confirmed",          v({ app_metadata: { provider: "email" } }, "2026-09-01T00:00:00Z"), true],
];
let bad = 0;
for (const [name, actual, expected] of cases) {
  const ok = actual === expected;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(40)} -> ${actual} (expected ${expected})`);
}
console.log(bad ? `\n${bad} FAILING` : "\nall pass");
process.exit(bad ? 1 : 0);
