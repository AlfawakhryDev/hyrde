"use client";
import { createContext, useContext, useCallback, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { messages } from "@/lib/messages";
import { translate, isLocale, dirFor, localeForPath, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void };
const I18n = createContext<Ctx>({ locale: DEFAULT_LOCALE, setLocale: () => {} });

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  return isLocale(m?.[1]) ? (m![1] as Locale) : DEFAULT_LOCALE;
}

// Whoever reads the locale cookie. setLocale writes it, then tells them.
const localeListeners = new Set<() => void>();
function subscribeToLocale(onChange: () => void) {
  localeListeners.add(onChange);
  return () => { localeListeners.delete(onChange); };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The cookie, read through useSyncExternalStore: the server snapshot keeps
  // hydration in step with the server render, and setLocale notifies the
  // subscribers, so there is no mount effect and no extra render.
  const cookieLocale = useSyncExternalStore(subscribeToLocale, readCookieLocale, () => DEFAULT_LOCALE);

  // Derived, not stored: recomputing on every navigation is what makes moving
  // between /ar, the English marketing pages and the app land in the right
  // language. The old version resolved once on mount and then went stale.
  const locale = localeForPath(pathname, cookieLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dirFor(locale); // rtl for Arabic — flips nav/footer too
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    localeListeners.forEach(notify => notify());
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
