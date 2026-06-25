import { describe, it, expect } from 'vitest';
import { nightDimLevel, burnInOffset, DEFAULT_MAX_DIM } from './ambient';
import type { PrayerInstant } from './schedule';

/** Minimal instants — nightDimLevel only reads the first adhān and last iqāmah. */
function instants(fajrAdhan: string, ishaIqamah: string): PrayerInstant[] {
  const at = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return new Date(2026, 5, 25, h, m, 0, 0);
  };
  const mk = (adhan: string, iqamah: string): PrayerInstant => ({
    name: 'P',
    displayName: 'P',
    adhan: at(adhan),
    iqamah: at(iqamah),
    isJummah: false,
  });
  // first = Fajr, last = Isha; middle prayers are irrelevant to the dim curve.
  return [mk(fajrAdhan, fajrAdhan), mk('13:00', '13:15'), mk(ishaIqamah, ishaIqamah)];
}

const at = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(2026, 5, 25, h, m, 0, 0);
};

describe('nightDimLevel', () => {
  const days = instants('05:00', '21:00'); // start dimming 21:45, bright by 04:30

  it('is fully bright during the day', () => {
    expect(nightDimLevel(at('12:00'), days)).toBe(0);
    expect(nightDimLevel(at('18:30'), days)).toBe(0);
  });

  it('stays bright until the post-Isha delay elapses', () => {
    expect(nightDimLevel(at('21:00'), days)).toBe(0);
    expect(nightDimLevel(at('21:30'), days)).toBe(0); // before 21:45 start
  });

  it('eases in over the ramp', () => {
    expect(nightDimLevel(at('22:00'), days)).toBeCloseTo(DEFAULT_MAX_DIM * 0.5, 5); // 15 of 30 min
  });

  it('reaches full dim deep in the night, across midnight', () => {
    expect(nightDimLevel(at('23:30'), days)).toBeCloseTo(DEFAULT_MAX_DIM, 5);
    expect(nightDimLevel(at('02:00'), days)).toBeCloseTo(DEFAULT_MAX_DIM, 5);
  });

  it('eases back out and is bright again before Fajr', () => {
    expect(nightDimLevel(at('04:15'), days)).toBeCloseTo(DEFAULT_MAX_DIM * 0.5, 5); // 15 min left
    expect(nightDimLevel(at('04:30'), days)).toBe(0);
    expect(nightDimLevel(at('05:00'), days)).toBe(0);
  });

  it('respects a custom maxDim', () => {
    expect(nightDimLevel(at('02:00'), days, { maxDim: 0.3 })).toBeCloseTo(0.3, 5);
  });

  it('is a no-op without enough prayer data', () => {
    expect(nightDimLevel(at('02:00'), [])).toBe(0);
  });
});

describe('burnInOffset', () => {
  it('stays within the configured radius', () => {
    for (let min = 0; min < 60; min += 3) {
      const { dx, dy } = burnInOffset(at(`0${Math.floor(min / 10)}:0${min % 10}`.slice(-5)), { radiusPx: 10 });
      expect(Math.abs(dx)).toBeLessThanOrEqual(10);
      expect(Math.abs(dy)).toBeLessThanOrEqual(6);
    }
  });

  it('moves over time (not a static offset)', () => {
    const a = burnInOffset(new Date(2026, 5, 25, 0, 0, 0), { radiusPx: 10, periodMs: 480_000 });
    const b = burnInOffset(new Date(2026, 5, 25, 0, 2, 0), { radiusPx: 10, periodMs: 480_000 });
    expect(a.dx === b.dx && a.dy === b.dy).toBe(false);
  });
});
