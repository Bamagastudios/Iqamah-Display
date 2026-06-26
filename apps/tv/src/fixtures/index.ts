import type { PrayerTimesResponse } from '../api/types';
import type { DisplayFeed } from '../api/displayFeed';
import sample from './sample-prayer-times.json';
import feed from './sample-display-feed.json';

/**
 * Committed real-shaped samples.
 *  - Unit tests import these (or build their own) for deterministic, fixed-date data.
 *  - The app uses the *ForToday helpers as a last-resort offline fallback so the screen
 *    never blanks before the first successful fetch.
 */
export const SAMPLE_RESPONSE = sample as PrayerTimesResponse;
export const SAMPLE_FEED = feed as DisplayFeed;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function todayParts(now: Date) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { date: `${y}-${m}-${d}`, weekday: WEEKDAYS[now.getDay()], isFriday: now.getDay() === 5 };
}

/** The sample prayer-times response with its date shifted to `now`'s local day. */
export function sampleResponseForToday(now: Date = new Date()): PrayerTimesResponse {
  return { ...SAMPLE_RESPONSE, ...todayParts(now) };
}

/** The sample feed with its prayer-times date shifted to `now`'s local day. */
export function sampleFeedForToday(now: Date = new Date()): DisplayFeed {
  const t = todayParts(now);
  return {
    ...SAMPLE_FEED,
    prayerTimes: { ...SAMPLE_FEED.prayerTimes, ...t },
  };
}
