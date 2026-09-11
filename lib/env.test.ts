import { describe, it, expect, vi, afterEach } from "vitest";

const NAMES = ["NEXT_PUBLIC_APP_ENV", "APP_ENV", "NEXT_PUBLIC_VERCEL_ENV", "VERCEL_ENV",
  "NEXT_PUBLIC_APP_RELEASE", "APP_RELEASE", "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA", "VERCEL_GIT_COMMIT_SHA"];
async function load(vars: Record<string, string>) {
  for (const n of NAMES) vi.stubEnv(n, vars[n] ?? "");
  vi.resetModules();
  return import("./env");
}

describe("env", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reads Vercel's own variables on Vercel", async () => {
    const e = await load({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_SHA: "abc1234" });
    expect([e.appEnv, e.appRelease, e.isDeployed]).toEqual(["preview", "abc1234", true]);
  });

  it("prefers APP_ENV and APP_RELEASE, so a move to AWS needs no code change", async () => {
    const e = await load({ VERCEL_ENV: "preview", APP_ENV: "production", APP_RELEASE: "v42" });
    expect([e.appEnv, e.appRelease]).toEqual(["production", "v42"]);
  });

  it("is development when nothing says otherwise, and so reports nothing", async () => {
    const e = await load({});
    expect([e.appEnv, e.isDeployed]).toEqual(["development", false]);
  });

  it("lets an empty APP_ENV fall through to Vercel's value instead of shadowing it", async () => {
    const e = await load({ APP_ENV: "", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: "def5678" });
    expect([e.appEnv, e.appRelease]).toEqual(["production", "def5678"]);
  });

  it("treats an unrecognised value as development rather than trusting it", async () => {
    expect((await load({ APP_ENV: "prod" })).appEnv).toBe("development");
  });
});
