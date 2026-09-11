import { test, expect } from "@playwright/test";

// Checks that only exist once JavaScript has run in a real browser.
test("the homepage renders without script errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("Arabic pages render right to left", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("the app opens in light mode, with the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test("marketing pages keep their dark theme", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
});
