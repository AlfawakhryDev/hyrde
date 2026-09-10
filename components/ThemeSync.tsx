"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { resolveDark } from "@/lib/theme";

// Re-applies the theme after hydration and on every client-side navigation.
//
// Both are necessary. React reconciles <html>'s className during hydration and
// wipes whatever the no-flash script decided — suppressHydrationWarning
// silences the warning, not the patch. And the script only runs on a full
// document load, so clicking from the dark marketing site into the dashboard
// would otherwise carry the dark theme in with it.
export default function ThemeSync() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolveDark(pathname));
  }, [pathname]);
  return null;
}
