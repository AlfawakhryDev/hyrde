"use client";
import { usePathname, useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n";
import { useLocale, useSetLocale } from "./I18nProvider";

// Marketing pages that have a German URL twin (SEO). App pages have no twin and
// re-render instantly from the context locale.
const TWIN: Record<string, string> = { "/": "/de", "/faq": "/de/faq" };

export default function LangSwitcher({ className = "" }: { className?: string }) {
  const active = useLocale();
  const setLocale = useSetLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(target: Locale) {
    if (target === active) return;
    setLocale(target); // sets cookie + re-renders app UI in the new language
    if (target === "de" && TWIN[pathname]) router.push(TWIN[pathname]);
    else if (target === "en" && pathname.startsWith("/de")) router.push(pathname.replace(/^\/de/, "") || "/");
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border-crisp bg-surface-container p-0.5 text-[12px] font-semibold ${className}`}
      role="group"
      aria-label="Language"
    >
      {(["en", "de"] as const).map(loc => (
        <button
          key={loc}
          onClick={() => switchTo(loc)}
          aria-pressed={active === loc}
          className={`px-2.5 h-6 rounded-full transition-colors ${
            active === loc ? "bg-on-surface text-inverse-on-surface" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {loc === "en" ? "EN" : "DE"}
        </button>
      ))}
    </div>
  );
}
