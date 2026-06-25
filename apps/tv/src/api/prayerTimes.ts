import type { PrayerTimesResponse } from './types';

// Same-origin path; vercel.json proxies it to the masjid site's real API so the
// browser never sees a cross-site request (no CORS). Override with VITE_PRAYER_API.
const DEFAULT_URL = '/api/prayer-times';

export function prayerApiUrl(): string {
  return import.meta.env.VITE_PRAYER_API ?? DEFAULT_URL;
}

/** Minimal structural guard — enough to trust the fields the app relies on. */
function isPrayerTimesResponse(value: unknown): value is PrayerTimesResponse {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.date === 'string' &&
    typeof o.hijriLabel === 'string' &&
    Array.isArray(o.prayers) &&
    o.prayers.length > 0 &&
    typeof o.jummah === 'object' &&
    o.jummah !== null
  );
}

/**
 * Fetch + validate the prayer-times API. Throws on network error, non-2xx, or an
 * unexpected shape — callers keep last-known-good data on throw (never blank).
 */
export async function fetchPrayerTimes(signal?: AbortSignal): Promise<PrayerTimesResponse> {
  const res = await fetch(prayerApiUrl(), {
    signal,
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Prayer API responded ${res.status}`);
  }

  const json: unknown = await res.json();
  if (!isPrayerTimesResponse(json)) {
    throw new Error('Prayer API returned an unexpected shape');
  }

  // `alerts` may be missing/null until the API populates it — normalize to an array.
  if (!Array.isArray(json.alerts)) {
    json.alerts = [];
  }
  return json;
}
