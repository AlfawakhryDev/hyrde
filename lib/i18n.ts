// ── Lightweight i18n foundation ─────────────────────────────────────────────
// No framework, no app restructure. German pages live under /de/* and reuse this
// hreflang helper so search engines link the EN and DE versions. Full app-UI
// translation is the incremental next step; the convention here is the pattern:
// an English page at `enPath` and its German twin at `dePath` both call
// altLanguages(enPath, dePath) in their metadata.
export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

// The hreflang alternates object for Next metadata `alternates.languages`.
// Both twins pass the same pair; each sets its own `canonical` separately.
export function altLanguages(enPath: string, dePath: string) {
  return { en: enPath, de: dePath, "x-default": enPath };
}
