/**
 * "Always-on" display helpers — pure and deterministic so they unit-test cleanly.
 *
 *  - nightDimLevel: how dark to make the board overnight (the masjid is typically
 *    empty between Isha and Fajr), eased in after Isha and out before Fajr.
 *  - burnInOffset: a slow sub-pixel drift of the whole board to avoid the static
 *    layout etching into a 24/7 panel (LCD image-persistence / OLED burn-in).
 *
 * Both take an explicit `now` (and prayer instants) — no Date.now(), no module state.
 */

import type { PrayerInstant } from './schedule';

/** Darkest the overnight dim ever gets (0 = bright, 1 = black). 0.5 stays readable. */
export const DEFAULT_MAX_DIM = 0.5;

export interface NightDimOptions {
  maxDim?: number;
  /** Minutes after Isha iqāmah before the board starts dimming. */
  startAfterIshaMin?: number;
  /** Minutes to ease fully in / fully out. */
  rampMin?: number;
  /** Minutes before Fajr adhān the board is fully bright again. */
  clearBeforeFajrMin?: number;
}

function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

/** Non-negative (a − b) on a 24h wall clock, in minutes — handles the midnight wrap. */
function cyclicDelta(a: number, b: number): number {
  return (((a - b) % 1440) + 1440) % 1440;
}

/**
 * Board dim level for `now` (0..maxDim). Works in minutes-of-day so the overnight
 * window is correct whether `now` is this evening or the small hours (the API day
 * may still read "yesterday"). Returns 0 — fully bright — during the daytime.
 */
export function nightDimLevel(now: Date, instants: PrayerInstant[], opts: NightDimOptions = {}): number {
  if (instants.length < 2) return 0;
  const maxDim = opts.maxDim ?? DEFAULT_MAX_DIM;
  const startAfter = opts.startAfterIshaMin ?? 45;
  const ramp = Math.max(1, opts.rampMin ?? 30);
  const clearBefore = opts.clearBeforeFajrMin ?? 30;

  const ishaMin = minutesOfDay(instants[instants.length - 1].iqamah);
  const fajrMin = minutesOfDay(instants[0].adhan);

  const start = (ishaMin + startAfter) % 1440; // dimming begins here
  const wake = (fajrMin - clearBefore + 1440) % 1440; // fully bright again by here
  const night = cyclicDelta(wake, start); // overnight length (minutes)
  if (night === 0) return 0;

  const since = cyclicDelta(minutesOfDay(now), start);
  if (since >= night) return 0; // daytime — no dim

  const easeIn = Math.min(1, since / ramp);
  const easeOut = Math.min(1, (night - since) / ramp);
  return maxDim * Math.max(0, Math.min(easeIn, easeOut));
}

export interface BurnInOptions {
  /** Drift radius in board pixels. */
  radiusPx?: number;
  /** Time for one full drift loop. */
  periodMs?: number;
}

/**
 * A slow Lissajous drift of the whole board, so no pixel shows the same content
 * forever. Tiny (a few px) and gradual — invisible to viewers, kind to the panel.
 */
export function burnInOffset(now: Date, opts: BurnInOptions = {}): { dx: number; dy: number } {
  const r = opts.radiusPx ?? 10;
  const period = Math.max(1000, opts.periodMs ?? 8 * 60_000);
  const a = (2 * Math.PI * (now.getTime() % period)) / period;
  return { dx: Math.round(r * Math.cos(a)), dy: Math.round(r * 0.6 * Math.sin(2 * a)) };
}
