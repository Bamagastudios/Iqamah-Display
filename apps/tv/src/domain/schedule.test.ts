import { describe, it, expect } from 'vitest';
import type { Prayer, PrayerTimesResponse } from '../api/types';
import {
  buildPrayerInstants,
  countdown,
  currentState,
  nextIqamah,
  parseLocalDateTime,
  DEFAULT_WINDOWS,
} from './schedule';
import { SAMPLE_RESPONSE } from '../fixtures';

// ---- helpers -------------------------------------------------------------

/** A local-time Date on the fixed test day (2026-06-22, a Monday). */
const day = (h: number, mi: number, s = 0) => new Date(2026, 5, 22, h, mi, s);

function mk(
  name: string,
  adhan: string,
  iqamah: string,
  adhan12: string,
  iqamah12: string,
): Prayer {
  return { name, displayName: name, adhan, iqamah, adhan12, iqamah12, isJummah: false };
}

function makeResp(overrides: Partial<PrayerTimesResponse> = {}): PrayerTimesResponse {
  return {
    location: { latitude: 29.7189, longitude: -95.6724 },
    date: '2026-06-22',
    weekday: 'Monday',
    isFriday: false,
    sunrise: '06:23',
    sunrise12: '6:23 AM',
    hijri: { year: 1448, month: 1, monthName: 'Muharram', day: 8 },
    hijriLabel: '8 Muharram 1448 AH',
    prayers: [
      mk('Fajr', '05:05', '05:45', '5:05 AM', '5:45 AM'),
      mk('Dhuhr', '13:18', '13:45', '1:18 PM', '1:45 PM'),
      mk('Asr', '17:00', '17:30', '5:00 PM', '5:30 PM'),
      mk('Maghrib', '20:24', '20:34', '8:24 PM', '8:34 PM'),
      mk('Isha', '21:45', '22:00', '9:45 PM', '10:00 PM'),
    ],
    jummah: { iqamah: '13:30', iqamah12: '1:30 PM' },
    alerts: [],
    ...overrides,
  };
}

// ---- parseLocalDateTime --------------------------------------------------

describe('parseLocalDateTime', () => {
  it('builds a local-time Date anchored to the API date', () => {
    const d = parseLocalDateTime('2026-06-22', '13:45');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5); // June (0-indexed)
    expect(d.getDate()).toBe(22);
    expect(d.getHours()).toBe(13);
    expect(d.getMinutes()).toBe(45);
  });
});

// ---- buildPrayerInstants -------------------------------------------------

describe('buildPrayerInstants', () => {
  it('builds five valid instants in order', () => {
    const instants = buildPrayerInstants(makeResp());
    expect(instants.map((p) => p.name)).toEqual(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']);
    for (const p of instants) {
      expect(Number.isNaN(p.adhan.getTime())).toBe(false);
      expect(Number.isNaN(p.iqamah.getTime())).toBe(false);
      expect(p.iqamah.getTime()).toBeGreaterThan(p.adhan.getTime());
    }
  });

  it('swaps the Dhuhr slot to Jummah on Fridays', () => {
    // 2026-06-26 is a Friday.
    const instants = buildPrayerInstants(makeResp({ date: '2026-06-26', isFriday: true }));
    const dhuhrSlot = instants[1];
    expect(dhuhrSlot.name).toBe('Dhuhr');
    expect(dhuhrSlot.displayName).toBe('Jummah');
    expect(dhuhrSlot.isJummah).toBe(true);
    // iqamah comes from jummah (13:30), not the weekday Dhuhr iqamah (13:45).
    expect(dhuhrSlot.iqamah.getHours()).toBe(13);
    expect(dhuhrSlot.iqamah.getMinutes()).toBe(30);
  });

  it('parses the committed sample fixture without producing NaN dates', () => {
    const instants = buildPrayerInstants(SAMPLE_RESPONSE);
    expect(instants).toHaveLength(5);
    for (const p of instants) {
      expect(Number.isNaN(p.iqamah.getTime())).toBe(false);
    }
  });
});

// ---- nextIqamah ----------------------------------------------------------

describe('nextIqamah', () => {
  const instants = buildPrayerInstants(makeResp());

  it('before Fajr → Fajr today', () => {
    const next = nextIqamah(instants, day(4, 0))!;
    expect(next.prayer).toBe('Fajr');
    expect(next.at.getDate()).toBe(22);
  });

  it('mid-morning → next is Dhuhr', () => {
    const next = nextIqamah(instants, day(10, 0))!;
    expect(next.prayer).toBe('Dhuhr');
  });

  it('just after Fajr iqamah → Dhuhr', () => {
    const next = nextIqamah(instants, day(5, 46))!;
    expect(next.prayer).toBe('Dhuhr');
  });

  it('rolls at the exact iqamah boundary (strictly after now)', () => {
    expect(nextIqamah(instants, day(13, 44, 59))!.prayer).toBe('Dhuhr');
    // At 13:45:00 exactly, Dhuhr is no longer "after now" → Asr.
    expect(nextIqamah(instants, day(13, 45, 0))!.prayer).toBe('Asr');
  });

  it('post-Isha → tomorrow Fajr (+24h), countdown positive and under a day', () => {
    const now = day(23, 0);
    const next = nextIqamah(instants, now)!;
    expect(next.prayer).toBe('Fajr');
    expect(next.at.getDate()).toBe(23); // next calendar day
    expect(next.at.getHours()).toBe(5);
    expect(next.at.getMinutes()).toBe(45);

    const cd = countdown(next.at, now);
    expect(cd.totalMs).toBeGreaterThan(0);
    expect(cd.totalMs).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it('stays continuous across midnight (23:50 day N and 00:10 day N+1 target the same Fajr)', () => {
    const beforeMidnight = day(23, 50); // 2026-06-22 23:50
    const afterMidnight = new Date(2026, 5, 23, 0, 10); // 2026-06-23 00:10

    const a = nextIqamah(instants, beforeMidnight)!;
    const b = nextIqamah(instants, afterMidnight)!;

    expect(a.prayer).toBe('Fajr');
    expect(b.prayer).toBe('Fajr');
    expect(a.at.getTime()).toBe(b.at.getTime()); // same 2026-06-23 05:45 target
    // Countdown keeps decreasing as real time advances.
    expect(countdown(b.at, afterMidnight).totalMs).toBeLessThan(
      countdown(a.at, beforeMidnight).totalMs,
    );
  });

  it('returns null for an empty schedule', () => {
    expect(nextIqamah([], day(10, 0))).toBeNull();
  });
});

// ---- countdown -----------------------------------------------------------

describe('countdown', () => {
  it('splits remaining time into h/m/s', () => {
    const cd = countdown(day(11, 2, 3), day(10, 0, 0));
    expect(cd).toMatchObject({ h: 1, m: 2, s: 3 });
  });

  it('clamps to zero when the target is in the past', () => {
    const cd = countdown(day(9, 0), day(10, 0));
    expect(cd).toMatchObject({ h: 0, m: 0, s: 0, totalMs: 0 });
  });

  it('ticks down second by second', () => {
    expect(countdown(day(10, 0, 0), day(9, 59, 0)).s).toBe(0);
    expect(countdown(day(10, 0, 0), day(9, 59, 1)).s).toBe(59);
    expect(countdown(day(10, 0, 0), day(9, 59, 1)).m).toBe(0);
  });
});

// ---- currentState --------------------------------------------------------

describe('currentState (Dhuhr: adhan 13:18, iqamah 13:45)', () => {
  const instants = buildPrayerInstants(makeResp());

  it('idle just before adhan', () => {
    expect(currentState(instants, day(13, 17, 59))).toEqual({ kind: 'idle' });
  });

  it('adhan at adhan time and through to iqamah', () => {
    expect(currentState(instants, day(13, 18, 0))).toEqual({ kind: 'adhan', prayer: 'Dhuhr' });
    expect(currentState(instants, day(13, 30))).toEqual({ kind: 'adhan', prayer: 'Dhuhr' });
    expect(currentState(instants, day(13, 44, 59))).toEqual({ kind: 'adhan', prayer: 'Dhuhr' });
  });

  it('iqamah moment at iqamah time (~first minute)', () => {
    expect(currentState(instants, day(13, 45, 0))).toEqual({ kind: 'iqamah', prayer: 'Dhuhr' });
    expect(currentState(instants, day(13, 45, 59))).toEqual({ kind: 'iqamah', prayer: 'Dhuhr' });
  });

  it('in progress after the iqamah moment, within the window', () => {
    expect(currentState(instants, day(13, 46, 0))).toEqual({ kind: 'inprogress', prayer: 'Dhuhr' });
    expect(currentState(instants, day(13, 50))).toEqual({ kind: 'inprogress', prayer: 'Dhuhr' });
  });

  it('back to idle once the in-progress window ends, with next pointing onward', () => {
    const after = day(13, 55, 0); // iqamah 13:45 + 10m
    expect(currentState(instants, after)).toEqual({ kind: 'idle' });
    expect(nextIqamah(instants, after)!.prayer).toBe('Asr');
  });

  it('a slightly-skewed clock still yields a deterministic state', () => {
    // Device clock 90s fast: "13:46:30" is past the iqamah moment → in progress.
    const skewed = day(13, 46, 30);
    expect(currentState(instants, skewed, DEFAULT_WINDOWS)).toEqual({
      kind: 'inprogress',
      prayer: 'Dhuhr',
    });
  });
});
