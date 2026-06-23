import type { PrayerTimesResponse } from '../api/types';
import sample from './sample-prayer-times.json';

/**
 * The committed real-shaped sample response.
 *
 * Two uses:
 *  - Unit tests import this (or build their own) for deterministic, fixed-date data.
 *  - The app uses {@link sampleResponseForToday} as a last-resort offline fallback so the
 *    screen never blanks before the first successful fetch.
 */
export const SAMPLE_RESPONSE = sample as PrayerTimesResponse;

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * The sample response with its calendar date shifted to `now`'s local day, so an
 * offline fallback shows today's date and a sensible live countdown. Hijri label is
 * left as-is (we can't recompute it offline); a real fetch replaces all of this.
 */
export function sampleResponseForToday(now: Date = new Date()): PrayerTimesResponse {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return {
    ...SAMPLE_RESPONSE,
    date: `${y}-${m}-${d}`,
    weekday: WEEKDAYS[now.getDay()],
    isFriday: now.getDay() === 5,
  };
}
