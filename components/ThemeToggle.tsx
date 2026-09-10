"use client";
import { useEffect, useState } from "react";
import { useT } from "./I18nProvider";
import { THEME_KEY } from "@/lib/theme";

// ── Light / dark switch ──────────────────────────────────────────────
// There was no way to change theme at all: the layout hardcoded `dark` and
// nothing in the UI ever wrote localStorage.theme, so whatever you were given
// on first paint was permanent.
//
// The stored value is the user's decision and outranks everything. Absent one,
// app pages open light and marketing stays dark — set in the no-flash script in
// layout.tsx, which has to agree with readDark() below.

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useT();
  // Server renders nothing decisive: the real value lives in localStorage,
  // which the server cannot see. Reading it after mount avoids a mismatch.
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
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
  const label = mounted && dark ? t("theme.toLight") : t("theme.toDark");

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface hover:border-on-surface transition-colors ${className}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
        {mounted && dark ? "light_mode" : "dark_mode"}
      </span>
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}
