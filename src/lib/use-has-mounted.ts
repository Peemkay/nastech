import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True once the component has hydrated on the client, false during SSR and
 * the first client render. Used to gate client-only state (zustand persist,
 * etc.) without a server/client markup mismatch.
 *
 * This replaces the old `useState(false) + useEffect(() => setState(true))`
 * pattern — useSyncExternalStore's getServerSnapshot/getSnapshot split is
 * the canonical way to answer "is this the client yet", straight from
 * React's own docs, and it doesn't call setState from inside an effect.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
