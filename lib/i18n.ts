// ── i18n foundation ─────────────────────────────────────────────────────────
// Two mechanisms, by design:
//  - Public/marketing pages are URL-based (/ = en, /de = de) for SEO + hreflang
//    (see app/de/*). Each EN page + its DE twin call altLanguages() in metadata.
//  - App/client UI is cookie-based: the LangSwitcher sets `hyrde_locale`, the root
//    layout reads it and provides messages to a client context (useT). Strings not
//    yet translated fall back to English, so switching works everywhere and German
//    coverage grows as the dictionary fills.
export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "hyrde_locale";

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "de";
}

// hreflang alternates for Next metadata `alternates.languages`.
export function altLanguages(enPath: string, dePath: string) {
  return { en: enPath, de: dePath, "x-default": enPath };
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
