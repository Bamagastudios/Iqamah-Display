import type { PrayerTimesResponse } from './types';

/**
 * Last-known-good cache in localStorage. Survives app restarts so the TV paints real
 * data immediately on launch, before (or instead of) the first network call.
 */

const KEY = 'masjidtv.prayerTimes.v1';

export interface CachedPrayerTimes {
  /** Epoch ms when this response was fetched. */
  fetchedAt: number;
  data: PrayerTimesResponse;
}

export function readCache(): CachedPrayerTimes | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPrayerTimes;
    // Cheap shape guard — a corrupt/partial entry is treated as no cache.
    if (!parsed || typeof parsed.fetchedAt !== 'number') return null;
    if (!parsed.data || !Array.isArray(parsed.data.prayers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache(data: PrayerTimesResponse): CachedPrayerTimes {
  const entry: CachedPrayerTimes = { fetchedAt: Date.now(), data };
  try {
    localStorage.setItem(KEY, JSON.stringify(entry));
  } catch {
    // Storage unavailable/full — non-fatal; we simply keep serving in-memory data.
  }
  return entry;
}
