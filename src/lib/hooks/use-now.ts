import { useSyncExternalStore } from "react";

// ── The current time, to the minute ──────────────────────────────────
// Date.now() while rendering answers differently on every render, which
// React's purity rule rejects. Minute precision is plenty for "has this been
// waiting 72 hours", and it re-renders at most once a minute. null on the
// server and during hydration, when there is no honest "now" to show.
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}
const thisMinute = () => Math.floor(Date.now() / 60_000) * 60_000;

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, thisMinute, () => null);
}
