import { useEffect, useState } from "react";

const MAX_INT32 = 2 ** 31 - 1;

/**
 * Schedules `onDeadlinePassed` to fire when the soonest *future* member-action
 * deadline passes, so "next task due" rolls forward (a passed deadline becomes
 * "missed" server-side) without the user leaving and returning. No-op when
 * every deadline is already in the past.
 *
 * Pass a memoized `onDeadlinePassed` (e.g. via `useCallback`) — its identity is
 * an effect dependency, so an unstable callback reschedules the timer on every
 * render.
 */
export function useOnNextDeadline(
  actions: { memberActionDeadline?: number | null }[] | undefined,
  onDeadlinePassed: () => void,
): void {
  // Bumped to re-run the effect (and re-arm the timer)
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!actions?.length) return;
    const now = Date.now();
    const futureDeadlines = actions
      .map((a) => a.memberActionDeadline)
      .filter((d): d is number => d != null && d > now);
    if (futureDeadlines.length === 0) return;
    const remainingMs = Math.min(...futureDeadlines) - now;
    // setTimeout stores its delay in a 32-bit signed int; a delay past ~24.8
    // days overflows and fires almost immediately, so cap the wait.
    const overflow = remainingMs > MAX_INT32;
    const timeoutId = setTimeout(
      () => {
        if (!overflow) onDeadlinePassed();
        setTick((t) => t + 1);
      },
      overflow ? MAX_INT32 : remainingMs,
    );
    return () => clearTimeout(timeoutId);
  }, [actions, onDeadlinePassed, tick]);
}
