/**
 * The tricky core: next-prayer, countdown, and prayer-state logic.
 *
 * Everything here is PURE — no I/O, no `Date.now()`, no module state. Each function
 * takes an explicit `now: Date`, so behaviour is fully deterministic and unit-testable
 * across every boundary (each adhan/iqamah, the post-Isha → next-day-Fajr rollover,
 * midnight, the Friday Dhuhr→Jummah swap, and a slightly-skewed device clock).
 *
 * Times from the API are masjid-local wall-clock strings; we anchor `Date`s to the
 * API's own `date` field rather than trusting the device timezone blindly.
 */

import type { PrayerTimesResponse } from '../api/types';

export interface PrayerInstant {
  /** Canonical key, e.g. "Fajr". */
  name: string;
  /** Label to show — "Jummah" for the Dhuhr slot on Fridays. */
  displayName: string;
  adhan: Date;
  iqamah: Date;
  isJummah: boolean;
}

export interface NextIqamah {
  /** Canonical key of the prayer whose iqamah is next. */
  prayer: string;
  displayName: string;
  /** Absolute time of that iqamah (may be tomorrow's Fajr after Isha). */
  at: Date;
}

export interface Countdown {
  h: number;
  m: number;
  s: number;
  /** Remaining milliseconds (>= 0). */
  totalMs: number;
}

export type PrayerState =
  | { kind: 'idle' }
  | { kind: 'adhan'; prayer: string }
  | { kind: 'iqamah'; prayer: string }
  | { kind: 'inprogress'; prayer: string };

export interface StateWindows {
  /** Length of the brief "Iqamah — P" moment after iqamah time. */
  iqamahMomentMs: number;
  /** Total length of the post-iqamah occupied window ("prayer in progress"). */
  inProgressMs: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_WINDOWS: StateWindows = {
  iqamahMomentMs: 60_000, // ~1 minute
  inProgressMs: 10 * 60_000, // ~10 minutes
};

const DHUHR = 'dhuhr';

/** Parse the API's `date` ("YYYY-MM-DD") + a "HH:mm" time into a local-time Date. */
export function parseLocalDateTime(dateISO: string, hhmm: string): Date {
  const [y, mo, d] = dateISO.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  return new Date(y, mo - 1, d, h, mi, 0, 0);
}

/**
 * Build absolute adhan/iqamah instants for the response's day. On Fridays the Dhuhr
 * slot's iqamah is replaced by `jummah.iqamah` (data-level swap; the visual swap is a
 * later phase).
 */
export function buildPrayerInstants(resp: PrayerTimesResponse): PrayerInstant[] {
  return resp.prayers.map((p) => {
    const isFridayDhuhr = resp.isFriday && p.name.toLowerCase() === DHUHR;
    const iqamahStr = isFridayDhuhr ? resp.jummah.iqamah : p.iqamah;
    return {
      name: p.name,
      displayName: isFridayDhuhr ? 'Jummah' : p.displayName,
      adhan: parseLocalDateTime(resp.date, p.adhan),
      iqamah: parseLocalDateTime(resp.date, iqamahStr),
      isJummah: isFridayDhuhr || p.isJummah,
    };
  });
}

/**
 * The next iqamah strictly after `now`. If none remain today (we're past Isha), roll to
 * tomorrow's Fajr — approximated as today's first iqamah + 24h, which self-corrects on
 * the next successful fetch once the API returns tomorrow's data.
 */
export function nextIqamah(instants: PrayerInstant[], now: Date): NextIqamah | null {
  if (instants.length === 0) return null;
  const t = now.getTime();

  for (const p of instants) {
    if (p.iqamah.getTime() > t) {
      return { prayer: p.name, displayName: p.displayName, at: p.iqamah };
    }
  }

  const first = instants[0];
  return {
    prayer: first.name,
    displayName: first.displayName,
    at: new Date(first.iqamah.getTime() + MS_PER_DAY),
  };
}

/** Remaining time from `now` to `target`, clamped at zero and split into h/m/s. */
export function countdown(target: Date, now: Date): Countdown {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const totalSec = Math.floor(totalMs / 1000);
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
    totalMs,
  };
}

/**
 * Which prayer "moment" we're in, if any:
 *   ADHAN(P)      [adhan, iqamah)
 *   IQAMAH(P)     [iqamah, iqamah + iqamahMomentMs)
 *   IN_PROGRESS(P)[iqamah + iqamahMomentMs, iqamah + inProgressMs)
 *   otherwise     IDLE (counting down to the next iqamah)
 *
 * Windows are disjoint per prayer; the first matching prayer (in Fajr→Isha order) wins.
 */
export function currentState(
  instants: PrayerInstant[],
  now: Date,
  windows: StateWindows = DEFAULT_WINDOWS,
): PrayerState {
  const t = now.getTime();

  for (const p of instants) {
    const adhanT = p.adhan.getTime();
    const iqamahT = p.iqamah.getTime();

    if (t >= iqamahT && t < iqamahT + windows.iqamahMomentMs) {
      return { kind: 'iqamah', prayer: p.displayName };
    }
    if (t >= iqamahT + windows.iqamahMomentMs && t < iqamahT + windows.inProgressMs) {
      return { kind: 'inprogress', prayer: p.displayName };
    }
    if (t >= adhanT && t < iqamahT) {
      return { kind: 'adhan', prayer: p.displayName };
    }
  }

  return { kind: 'idle' };
}
