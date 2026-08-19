import { describe, it, expect } from 'vitest';
import { applyManualTimes, enforceMaghribOffset, addMinutesHHMM, to12h, type ManualTimes } from './manualTimes';
import type { PrayerTimesResponse } from '../api/types';

function base(): PrayerTimesResponse {
  const p = (name: string, adhan: string, iqamah: string, a12: string, i12: string) => ({
    name,
    displayName: name,
    adhan,
    iqamah,
    adhan12: a12,
    iqamah12: i12,
    isJummah: false,
  });
  return {
    date: '2026-06-22',
    weekday: 'Monday',
    isFriday: false,
    sunrise: '06:44',
    sunrise12: '6:44 AM',
    hijriLabel: '20 Safar 1448 AH',
    prayers: [
      p('Fajr', '05:31', '06:00', '5:31 AM', '6:00 AM'),
      p('Dhuhr', '13:29', '14:00', '1:29 PM', '2:00 PM'),
      p('Asr', '17:05', '17:15', '5:05 PM', '5:15 PM'),
      p('Maghrib', '20:14', '20:24', '8:14 PM', '8:24 PM'),
      p('Isha', '21:26', '21:45', '9:26 PM', '9:45 PM'),
    ],
    jummah: { iqamah: '13:30', iqamah12: '1:30 PM' },
    alerts: [],
  };
}

const manual: ManualTimes = { mode: 'backup', iqamah: { Fajr: '06:15', Isha: '22:00' }, jummah: '13:45' };
const now = new Date(2026, 7, 4, 10, 0, 0); // 2026-08-04

describe('to12h', () => {
  it('converts 24h to 12h', () => {
    expect(to12h('06:00')).toBe('6:00 AM');
    expect(to12h('13:30')).toBe('1:30 PM');
    expect(to12h('00:15')).toBe('12:15 AM');
    expect(to12h('12:05')).toBe('12:05 PM');
    expect(to12h('23:59')).toBe('11:59 PM');
  });
  it('passes through unparseable input', () => {
    expect(to12h('')).toBe('');
    expect(to12h('nope')).toBe('nope');
    expect(to12h('25:00')).toBe('25:00');
  });
});

describe('applyManualTimes', () => {
  it("mode 'off' returns the base untouched", () => {
    const r = applyManualTimes(base(), { ...manual, mode: 'off' }, { live: false, now });
    expect(r.prayers[0].iqamah).toBe('06:00');
    expect(r.jummah.iqamah).toBe('13:30');
  });

  it("mode 'backup' does nothing while the feed is live", () => {
    const r = applyManualTimes(base(), manual, { live: true, now });
    expect(r.prayers[0].iqamah).toBe('06:00');
    expect(r.date).toBe('2026-06-22');
  });

  it("mode 'backup' overlays iqāmah (and re-anchors the date) when not live", () => {
    const r = applyManualTimes(base(), manual, { live: false, now });
    expect(r.prayers[0].iqamah).toBe('06:15'); // Fajr overridden
    expect(r.prayers[0].iqamah12).toBe('6:15 AM');
    expect(r.prayers[0].adhan).toBe('05:31'); // adhān untouched
    expect(r.prayers[1].iqamah).toBe('14:00'); // Dhuhr not in manual → kept
    expect(r.prayers[4].iqamah12).toBe('10:00 PM'); // Isha
    expect(r.jummah.iqamah).toBe('13:45');
    expect(r.jummah.iqamah12).toBe('1:45 PM');
    expect(r.date).toBe('2026-08-04'); // re-anchored to `now`
  });

  it("mode 'always' overrides even a live feed, keeping the live date", () => {
    const r = applyManualTimes(base(), { ...manual, mode: 'always' }, { live: true, now });
    expect(r.prayers[0].iqamah).toBe('06:15');
    expect(r.date).toBe('2026-06-22'); // live date kept
  });

  it('is a no-op when there are no manual times', () => {
    expect(applyManualTimes(base(), undefined, { live: false, now }).prayers[0].iqamah).toBe('06:00');
  });

  it('never overrides Maghrib from the manual list', () => {
    const withMaghrib = { ...manual, iqamah: { ...manual.iqamah, Maghrib: '21:00' } };
    const r = applyManualTimes(base(), withMaghrib, { live: false, now });
    expect(r.prayers[3].name).toBe('Maghrib');
    expect(r.prayers[3].iqamah).toBe('20:24'); // base kept — not the manual 21:00
  });
});

describe('addMinutesHHMM', () => {
  it('adds minutes', () => {
    expect(addMinutesHHMM('20:14', 10)).toBe('20:24');
    expect(addMinutesHHMM('05:31', 29)).toBe('06:00');
  });
  it('wraps past midnight', () => {
    expect(addMinutesHHMM('23:55', 10)).toBe('00:05');
  });
  it('passes through bad input', () => {
    expect(addMinutesHHMM('nope', 10)).toBe('nope');
  });
});

describe('enforceMaghribOffset', () => {
  it('pins Maghrib iqāmah to adhān + 10 min by default', () => {
    const r = enforceMaghribOffset(base());
    expect(r.prayers[3].iqamah).toBe('20:24'); // adhān 20:14 + 10
    expect(r.prayers[3].iqamah12).toBe('8:24 PM');
  });
  it('honors a custom offset and leaves other prayers alone', () => {
    const r = enforceMaghribOffset(base(), 5);
    expect(r.prayers[3].iqamah).toBe('20:19');
    expect(r.prayers[0].iqamah).toBe('06:00'); // Fajr untouched
  });
});
