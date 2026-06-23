import { useEffect, useRef, useState } from 'react';
import type { PrayerTimesResponse } from '../api/types';
import { fetchPrayerTimes } from '../api/prayerTimes';
import { readCache, writeCache } from '../api/cache';
import { sampleResponseForToday } from '../fixtures';

const POLL_MS = 60_000;

export type DataSource = 'live' | 'cache' | 'sample';

export interface PrayerDataState {
  /** Always non-null after mount — we hydrate from cache or the bundled sample first. */
  data: PrayerTimesResponse;
  source: DataSource;
  /** True when we're showing cache/sample because the last fetch hasn't succeeded yet. */
  stale: boolean;
  /** Epoch ms of the data on screen (null for the bundled sample). */
  lastUpdated: number | null;
  error: string | null;
}

function initialState(): PrayerDataState {
  const cached = readCache();
  if (cached) {
    return { data: cached.data, source: 'cache', stale: true, lastUpdated: cached.fetchedAt, error: null };
  }
  // No cache yet → show the real-shaped sample so the screen never blanks.
  return { data: sampleResponseForToday(), source: 'sample', stale: true, lastUpdated: null, error: null };
}

/**
 * Resilient prayer-times state:
 *   1. Hydrate synchronously from localStorage cache (or bundled sample) — no blank paint.
 *   2. Fetch on mount, then poll every `pollMs`.
 *   3. On any failure, keep last-known-good and mark `stale` — never blank, never throw.
 *
 * (Merging Supabase content happens in Phase 4; this hook is prayer-API only for now.)
 */
export function usePrayerData(pollMs = POLL_MS): PrayerDataState {
  const [state, setState] = useState<PrayerDataState>(initialState);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const ac = new AbortController();

    async function load() {
      try {
        const data = await fetchPrayerTimes(ac.signal);
        const entry = writeCache(data);
        if (!mounted.current) return;
        setState({ data, source: 'live', stale: false, lastUpdated: entry.fetchedAt, error: null });
      } catch (err) {
        if (!mounted.current || ac.signal.aborted) return;
        // Keep whatever we're already showing; just flag it as stale.
        setState((prev) => ({
          ...prev,
          stale: true,
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    }

    void load();
    const id = setInterval(load, pollMs);

    return () => {
      mounted.current = false;
      ac.abort();
      clearInterval(id);
    };
  }, [pollMs]);

  return state;
}
