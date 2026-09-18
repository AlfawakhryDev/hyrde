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

// Each language named in itself — the one label a speaker of it can always
// read. "AR" told an Arabic speaker nothing; "العربية" needs no translating.
const LABEL: Record<Locale, string> = { en: "English", de: "Deutsch", ar: "العربية" };

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

  // A native select rather than three pills: it shows the language you are
  // actually in, spelled out, in the width of one word — and it is keyboard
  // and screen-reader correct without any of the code a custom menu needs.
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <span
        className="material-symbols-outlined absolute left-2.5 pointer-events-none text-on-surface-variant"
        style={{ fontSize: "16px" }}
        aria-hidden="true"
      >
        language
      </span>
      <select
        value={active}
        onChange={e => switchTo(e.target.value as Locale)}
        aria-label={LABEL[active]}
        className="appearance-none h-8 ps-8 pe-7 rounded-full border border-border-crisp bg-surface-container text-[12.5px] font-medium text-on-surface hover:border-on-surface transition-colors focus:outline-none focus:border-on-surface cursor-pointer"
      >
        {(["en", "de", "ar"] as const).map(loc => (
          <option key={loc} value={loc}>{LABEL[loc]}</option>
        ))}
      </select>
      <span
        className="material-symbols-outlined absolute end-1.5 pointer-events-none text-on-surface-variant"
        style={{ fontSize: "16px" }}
        aria-hidden="true"
      >
        expand_more
      </span>
    </span>
  );
}
