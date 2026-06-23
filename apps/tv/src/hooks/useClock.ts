import { useEffect, useState } from 'react';

/**
 * A ticking clock. Re-renders the consumer every `intervalMs` (default 1s) with a fresh
 * `Date`. The countdown derives from `target - now` each tick, so it can't drift.
 */
export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
