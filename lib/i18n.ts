// ── i18n foundation ─────────────────────────────────────────────────────────
// Two mechanisms, by design:
//  - Public/marketing pages are URL-based (/ = en, /de = de) for SEO + hreflang
//    (see app/de/*). Each EN page + its DE twin call altLanguages() in metadata.
//  - App/client UI is cookie-based: the LangSwitcher sets `hyrde_locale`, the root
//    layout reads it and provides messages to a client context (useT). Strings not
//    yet translated fall back to English, so switching works everywhere and German
//    coverage grows as the dictionary fills.
export const LOCALES = ["en", "de", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "hyrde_locale";

// Right-to-left locales. Arabic renders RTL; everything below the <html dir>
// flips automatically (text alignment, flex/inline flow, list markers).
export const RTL_LOCALES: readonly Locale[] = ["ar"];
export function dirFor(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "de" || v === "ar";
}

// Pages whose copy is rendered from the dictionary at runtime. Everywhere else
// the URL is the language: /ar/* is Arabic, /de/* is German, and a bare path is
// English prose. That distinction matters because `dir` follows the locale — an
// Arabic cookie was flipping the English homepage to RTL, which put the full
// stop on the wrong side of every sentence and broke the hero outright.
const APP_PREFIXES = [
  "/dashboard", "/onboarding", "/profile", "/billing", "/t/", "/vetting",
  "/login", "/signup", "/verify", "/post-job", "/admin", "/welcome", "/jobs",
];

export function localeForPath(path: string, cookie: Locale): Locale {
  if (/^\/ar(\/|$)/.test(path)) return "ar";
  if (/^\/de(\/|$)/.test(path)) return "de";
  const isApp = APP_PREFIXES.some(p => path === p.replace(/\/$/, "") || path.startsWith(p));
  return isApp ? cookie : DEFAULT_LOCALE;
}

// hreflang alternates for Next metadata `alternates.languages`. Arabic uses the
// ar-SA region tag (Saudi) as the primary Arabic signal for search engines.
export function altLanguages(enPath: string, dePath: string, arPath: string) {
  return { en: enPath, de: dePath, "ar-SA": arPath, "x-default": enPath };
}

// A translator bound to an explicit locale (works in server + client render, no
// context needed). Used by the marketing homepage + demos which are URL-based.
import { messages } from "./messages";
export function tFor(locale: Locale) {
  return (key: string, vars?: Record<string, string | number>) =>
    translate(messages[locale] as Record<string, unknown>, messages.en as Record<string, unknown>, key, vars);
}

// Dot-path lookup with {var} interpolation; falls back to English, then the key.
export function translate(
  messages: Record<string, unknown>,
  fallback: Record<string, unknown>,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const pick = (obj: Record<string, unknown>) =>
    key.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
  let s = pick(messages);
  if (typeof s !== "string") s = pick(fallback);
  if (typeof s !== "string") return key;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : s;
}
