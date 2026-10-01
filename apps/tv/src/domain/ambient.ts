/**
 * "Always-on" display helpers — pure and deterministic so they unit-test cleanly.
 *
 *  - nightDimLevel: how dark to make the board overnight (the masjid is typically
 *    empty between Isha and Fajr), eased in after Isha and out before Fajr.
 *  - burnInOffset: a few-pixel shift of the whole board once an hour, to keep the static
 *    layout from etching into a 24/7 panel (LCD image-persistence / OLED burn-in).
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
  /** Shift radius in board pixels. */
  radiusPx?: number;
  /** How long the board holds each position (default one hour). */
  holdMs?: number;
  /** Distinct positions in one loop (default 8). */
  positions?: number;
}

/**
 * A small shift of the whole board once an hour, cycling through a few positions on an
 * ellipse, so no pixel shows the same content forever. The board holds perfectly still in
 * between — a continuous drift re-composites the entire screen every few seconds, which a
 * Fire TV shows as a visible stutter. Moves land on the local hour.
 */
export function burnInOffset(now: Date, opts: BurnInOptions = {}): { dx: number; dy: number } {
  const r = opts.radiusPx ?? 8;
  const hold = Math.max(60_000, opts.holdMs ?? 60 * 60_000);
  const n = Math.max(2, Math.round(opts.positions ?? 8));
  const wallClockMs = now.getTime() - now.getTimezoneOffset() * 60_000;
  const k = Math.floor(wallClockMs / hold) % n;
  const a = (2 * Math.PI * k) / n;
  // `|| 0` folds -0 into 0 so the CSS string and comparisons stay clean
  return { dx: Math.round(r * Math.cos(a)) || 0, dy: Math.round(r * 0.6 * Math.sin(a)) || 0 };
}
