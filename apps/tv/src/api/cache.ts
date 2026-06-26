import type { DisplayFeed } from './displayFeed';

/**
 * Last-known-good cache of the whole display feed in localStorage. Survives app
 * restarts so the TV paints real data immediately on launch, before (or instead of)
 * the first network call.
 */

const KEY = 'masjidtv.feed.v1';

export interface CachedFeed {
  /** Epoch ms when this feed was fetched. */
  fetchedAt: number;
  data: DisplayFeed;
}

export function readCache(): CachedFeed | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedFeed;
    if (!parsed || typeof parsed.fetchedAt !== 'number') return null;
    if (!parsed.data?.prayerTimes || !Array.isArray(parsed.data.prayerTimes.prayers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache(data: DisplayFeed): CachedFeed {
  const entry: CachedFeed = { fetchedAt: Date.now(), data };
  try {
    localStorage.setItem(KEY, JSON.stringify(entry));
  } catch {
    // Storage unavailable/full — non-fatal; keep serving in-memory data.
  }
  return entry;
}
