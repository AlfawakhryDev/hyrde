import { describe, it, expect } from "vitest";
import { THEME_SCRIPT, LOCALE_SCRIPT } from "./noflash";
import { isAppPath } from "./theme";
import { localeForPath } from "./i18n";

// These scripts ship as raw text and run before React, so the compiler never
// sees them. One lost backslash made the theme script a SyntaxError on every
// page. These tests parse them and run them against a stand-in browser.
type Doc = { documentElement: { lang?: string; dir?: string; dark?: boolean; classList: { toggle(c: string, on: boolean): void } }; cookie: string };

function run(script: string, pathname: string, saved: string | null = null, cookie = "") {
  const doc: Doc = {
    cookie,
    documentElement: { classList: { toggle(_c, on) { doc.documentElement.dark = on; } } },
  };
  const storage = { getItem: () => saved };
  new Function("localStorage", "location", "document", script)(storage, { pathname }, doc);
  return doc.documentElement;
}

describe("pre-paint scripts", () => {
  it("both parse as JavaScript", () => {
    expect(() => new Function(THEME_SCRIPT)).not.toThrow();
    expect(() => new Function(LOCALE_SCRIPT)).not.toThrow();
  });

  it.each([
    ["/dashboard", null, false],
    ["/t", null, false],
    ["/t/123", null, false],
    ["/pricing", null, true],
    ["/tasks", null, true],
    ["/", null, true],
    ["/dashboard", "dark", true],
    ["/", "light", false],
  ])("theme on %s with saved=%s → dark=%s", (path, saved, dark) => {
    expect(run(THEME_SCRIPT, path, saved).dark).toBe(dark);
  });

  it.each([
    ["/ar", "", "ar", "rtl"],
    ["/ar/guides/x", "hyrde_locale=de", "ar", "rtl"],
    ["/de/faq", "", "de", "ltr"],
    ["/dashboard", "hyrde_locale=de", "de", "ltr"],
    ["/dashboard", "", "ar", "rtl"],
    ["/pricing", "hyrde_locale=ar", "en", "ltr"],
  ])("locale on %s with cookie %j → %s/%s", (path, cookie, lang, dir) => {
    const el = run(LOCALE_SCRIPT, path, null, cookie);
    expect([el.lang, el.dir]).toEqual([lang, dir]);
  });

  it("agrees with the app's own definitions, so first paint matches what React renders", () => {
    for (const path of ["/", "/pricing", "/dashboard", "/dashboard/x", "/t", "/t/1", "/tasks", "/login", "/ar", "/de/faq"]) {
      expect(run(THEME_SCRIPT, path).dark, path).toBe(!isAppPath(path));
      expect(run(LOCALE_SCRIPT, path, null, "hyrde_locale=de").lang, path).toBe(localeForPath(path, "de"));
    }
  });
});
