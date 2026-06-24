import { useEffect, useRef, useState } from 'react';
import type { DisplayFeed } from '../api/displayFeed';
import { fetchDisplayFeed } from '../api/displayFeed';
import { readCache, writeCache } from '../api/cache';
import { sampleFeedForToday } from '../fixtures';

const POLL_MS = 30_000; // the feed refreshes ~every 30s

export type DataSource = 'live' | 'cache' | 'sample';

export interface DisplayDataState {
  /** Always non-null after mount — hydrated from cache or the bundled sample first. */
  feed: DisplayFeed;
  source: DataSource;
  /** True while showing cache/sample because the last fetch hasn't succeeded. */
  stale: boolean;
  lastUpdated: number | null;
  error: string | null;
}

function initialState(): DisplayDataState {
  const cached = readCache();
  if (cached) {
    return { feed: cached.data, source: 'cache', stale: true, lastUpdated: cached.fetchedAt, error: null };
  }
  return { feed: sampleFeedForToday(), source: 'sample', stale: true, lastUpdated: null, error: null };
}

/**
 * Resilient feed state: hydrate from cache/sample (no blank paint) → fetch on mount →
 * poll every 30s → on any failure keep last-known-good and mark `stale`. Never blanks.
 */
export function useDisplayData(pollMs = POLL_MS): DisplayDataState {
  const [state, setState] = useState<DisplayDataState>(initialState);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const ac = new AbortController();

    async function load() {
      try {
        const feed = await fetchDisplayFeed(ac.signal);
        const entry = writeCache(feed);
        if (!mounted.current) return;
        setState({ feed, source: 'live', stale: false, lastUpdated: entry.fetchedAt, error: null });
      } catch (err) {
        if (!mounted.current || ac.signal.aborted) return;
        setState((prev) => ({ ...prev, stale: true, error: err instanceof Error ? err.message : String(err) }));
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
