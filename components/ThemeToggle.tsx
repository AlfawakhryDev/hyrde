"use client";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useT } from "./I18nProvider";
import { THEME_KEY, isAppPath } from "@/lib/theme";

// ── Light / dark switch ──────────────────────────────────────────────
// There was no way to change theme at all: the layout hardcoded `dark` and
// nothing in the UI ever wrote localStorage.theme, so whatever you were given
// on first paint was permanent.
//
// The stored value is the user's decision and outranks everything. Absent one,
// app pages open light and marketing stays dark — set in the no-flash script in
// layout.tsx, which has to agree with readDark() below.

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useT();
  // The <html> class is the truth (set before paint by lib/noflash.ts, kept in
  // step by ThemeSync), read through useSyncExternalStore so this re-renders
  // whenever it changes, from anywhere. The server cannot see it, so it
  // assumes the page's default: dark for marketing, light for the app.
  const serverDark = !isAppPath(usePathname());
  const dark = useSyncExternalStore(subscribeToTheme, isDark, () => serverDark);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // Private browsing with storage denied: the class still flipped, so the
      // switch works for this tab. It simply will not be remembered.
    }
  }

  // Label says what you GET, not what you are on — a button reading "Dark"
  // while the screen is dark is the classic ambiguity here.
  const label = dark ? t("theme.toLight") : t("theme.toDark");

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface hover:border-on-surface transition-colors ${className}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
        {dark ? "light_mode" : "dark_mode"}
      </span>
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}
