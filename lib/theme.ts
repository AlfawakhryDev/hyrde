import { APP_PREFIXES } from "./i18n";

// ── Which theme a page opens in ──────────────────────────────────────
// Three places need to agree on this: the no-flash script in layout.tsx (which
// cannot import anything, so it repeats the logic inline), ThemeSync, and the
// toggle button. This is the definition the two TypeScript ones share.
//
// A saved choice always wins. With none, the app opens light — it is a work
// surface, read all day — and marketing keeps its dark art direction.

export const THEME_KEY = "theme";

export function isAppPath(path: string): boolean {
  return APP_PREFIXES.some(p => path === p.replace(/\/$/, "") || path.startsWith(p));
}

export function resolveDark(path: string): boolean {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch {
    // Storage denied (private mode). Fall through to the per-page default.
  }
  return saved ? saved === "dark" : !isAppPath(path);
}
