import { defineConfig, devices } from "@playwright/test";

// Smoke tests for a DEPLOYED site. Point BASE_URL at any environment:
//   BASE_URL=https://hyrde.net E2E_ENV=production npm run e2e
// Portable by design: the only host-specific piece is the optional Vercel
// protection-bypass header for previews. On AWS, leave it unset.
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    extraHTTPHeaders: bypass
      ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" }
      : undefined,
    // Never traces: they record request headers, including the bypass
    // secret, and CI artifacts of this public repo are public.
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "api", testMatch: /.*\.api\.spec\.ts/ },
    { name: "browser", testMatch: /.*\.browser\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
  ],
});
