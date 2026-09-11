import { test, expect } from "@playwright/test";

// Fast checks over HTTP, no browser. They run after every deployment, so a
// release that breaks one of these is caught in minutes, not by a user.
const isProduction = process.env.E2E_ENV === "production";

test("health: serving and the database is reachable", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true, db: "up" });
});

test("key pages answer 200", async ({ request }) => {
  for (const path of ["/", "/ar", "/pricing", "/login", "/signup", "/cost-estimator", "/ar/guides"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
});

test("the sitemap lists the site", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  expect(((await res.text()).match(/<url>/g) ?? []).length).toBeGreaterThan(200);
});

test("an admin page shows a signed-out visitor nothing", async ({ request }) => {
  const res = await request.get("/admin/candidates", { maxRedirects: 0 });
  const body = await res.text();
  // A streaming redirect (200 carrying NEXT_REDIRECT) or a real 3xx are both
  // fine. What must never reach a stranger is the page itself.
  expect(body).not.toContain("Everyone who signed up to work");
  expect([200, 302, 303, 307, 308]).toContain(res.status());
  if (res.status() === 200) expect(body).toContain("NEXT_REDIRECT");
});

test("the Sentry test route is closed in production", async ({ request }) => {
  test.skip(!isProduction, "only meaningful against production");
  expect((await request.get("/api/debug/sentry")).status()).toBe(404);
});
