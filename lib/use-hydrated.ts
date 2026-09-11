import { useSyncExternalStore } from "react";

// ── Am I running in the browser yet? ─────────────────────────────────
// false on the server and during hydration, true afterwards. It replaces the
// `const [mounted, setMounted] = useState(false); useEffect(() =>
// setMounted(true), [])` idiom, which costs an extra render on every mount
// and is exactly what React's set-state-in-effect rule warns about.
const noSubscription = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}
