import { describe, it, expect } from "vitest";
import { isEmailVerified as v } from "./verified";

// Guards the case that actually broke: an OAuth account whose
// app_metadata.provider was missing got defaulted to "email" and sent to the
// confirm-your-email wall.
const cases: [string, boolean, boolean][] = [
  ["google signup, no code",              v({ app_metadata: { provider: "google", providers: ["google"] }, identities: [{ provider: "google" }] }, null), true],
  ["github signup, no code",              v({ app_metadata: { provider: "github", providers: ["github"] } }, null), true],
  ["linkedin signup, no code",            v({ app_metadata: { provider: "linkedin_oidc" } }, null), true],
  ["OAuth but provider undefined (the bug)", v({ app_metadata: {} }, null), true],
  ["no app_metadata at all",              v({}, null), true],
  ["null user",                           v(null, null), true],
  ["signed up email, later linked google", v({ app_metadata: { provider: "email", providers: ["email", "google"] } }, null), true],
  ["identity says google, metadata email", v({ app_metadata: { provider: "email" }, identities: [{ provider: "google" }] }, null), true],
  ["password signup, unconfirmed",        v({ app_metadata: { provider: "email", providers: ["email"] }, identities: [{ provider: "email" }] }, null), false],
  ["password signup, confirmed",          v({ app_metadata: { provider: "email" } }, "2026-09-01T00:00:00Z"), true],
];

describe("isEmailVerified", () => {
  it.each(cases)("%s", (_name, actual, expected) => {
    expect(actual).toBe(expected);
  });
});
