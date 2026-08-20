"use client";
import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { messages } from "@/lib/messages";
import { translate, isLocale, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void };
const I18n = createContext<Ctx>({ locale: DEFAULT_LOCALE, setLocale: () => {} });

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  return isLocale(m?.[1]) ? (m![1] as Locale) : DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // First paint is `en` to match SSR; the cookie is applied after mount (app UI
  // only, so a brief flip on load is fine and there's no hydration mismatch).
  const [locale, set] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    const l = readCookieLocale();
    set(l);
    document.documentElement.lang = l;
  }, []);
  const setLocale = useCallback((l: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
    set(l);
  }, []);
  return <I18n.Provider value={{ locale, setLocale }}>{children}</I18n.Provider>;
}

export const useLocale = () => useContext(I18n).locale;
export const useSetLocale = () => useContext(I18n).setLocale;

// t("nav.findWork") or t("dash.milestone", { n: 2 }). Falls back to English, then key.
export function useT() {
  const { locale } = useContext(I18n);
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(messages[locale], messages.en, key, vars),
    [locale],
  );
}
