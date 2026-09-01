"use client";
import { usePathname, useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n";
import { useLocale, useSetLocale } from "./I18nProvider";

// Marketing pages that have localized URL twins (SEO). Keyed by the English base
// path; each entry maps to the /de and /ar URL. App pages have no twin and just
// re-render from the context locale (and flip dir for Arabic via setLocale).
const TWIN: Record<string, { de: string; ar: string }> = {
  "/": { de: "/de", ar: "/ar" },
  "/faq": { de: "/de/faq", ar: "/ar/faq" },
};

// Strip a /de or /ar prefix to get the English base path.
function enBase(path: string): string {
  if (path === "/de" || path === "/ar") return "/";
  return path.replace(/^\/(de|ar)(?=\/)/, "") || "/";
}

const LABEL: Record<Locale, string> = { en: "EN", de: "DE", ar: "AR" };

export default function LangSwitcher({ className = "" }: { className?: string }) {
  const active = useLocale();
  const setLocale = useSetLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(target: Locale) {
    if (target === active) return;
    setLocale(target); // cookie + dir + re-render app UI in the new language
    const base = enBase(pathname);
    const twin = TWIN[base];
    if (twin) {
      router.push(target === "en" ? base : twin[target]);
    } else if (target === "en" && /^\/(de|ar)(\/|$)/.test(pathname)) {
      router.push(base);
    }
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border-crisp bg-surface-container p-0.5 text-[12px] font-semibold ${className}`}
      role="group"
      aria-label="Language"
    >
      {(["en", "de", "ar"] as const).map(loc => (
        <button
          key={loc}
          onClick={() => switchTo(loc)}
          aria-pressed={active === loc}
          className={`px-2.5 h-6 rounded-full transition-colors ${
            active === loc ? "bg-on-surface text-inverse-on-surface" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {LABEL[loc]}
        </button>
      ))}
    </div>
  );
}
