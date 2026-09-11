import { describe, it, expect } from "vitest";
import { localeForPath, dirFor, isLocale } from "./i18n";

// URL-localised marketing vs cookie-localised app. Mixing them up once
// flipped the English homepage to RTL.
describe("localeForPath", () => {
  it("lets the URL decide on /ar and /de, whatever the cookie says", () => {
    expect(localeForPath("/ar", "en")).toBe("ar");
    expect(localeForPath("/ar/guides/x", "de")).toBe("ar");
    expect(localeForPath("/de/faq", "ar")).toBe("de");
  });
  it("does not mistake a path that merely starts with the letters", () => {
    expect(localeForPath("/arabic", "de")).toBe("en");
  });
  it("uses the cookie inside the app", () => {
    expect(localeForPath("/dashboard", "ar")).toBe("ar");
    expect(localeForPath("/dashboard/settings", "de")).toBe("de");
    expect(localeForPath("/t/123", "ar")).toBe("ar");
    expect(localeForPath("/t", "ar")).toBe("ar");
  });
  it("renders English marketing pages in English, even with an Arabic cookie", () => {
    expect(localeForPath("/pricing", "ar")).toBe("en");
    expect(localeForPath("/", "ar")).toBe("en");
  });
  it("does not treat /tasks as the /t/ app route", () => {
    expect(localeForPath("/tasks", "ar")).toBe("en");
  });
});

describe("dirFor / isLocale", () => {
  it("is RTL for Arabic only", () => {
    expect(dirFor("ar")).toBe("rtl");
    expect(dirFor("en")).toBe("ltr");
    expect(dirFor("de")).toBe("ltr");
  });
  it("accepts only the three supported locales", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
