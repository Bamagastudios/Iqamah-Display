import { describe, it, expect } from 'vitest';
import { datoToIqamah, parseFlexibleTime } from './datoCms';

describe('parseFlexibleTime', () => {
  it('reads the website style (6:30am, 8:45pm)', () => {
    expect(parseFlexibleTime('6:30am')).toBe('06:30');
    expect(parseFlexibleTime('2:00pm')).toBe('14:00');
    expect(parseFlexibleTime('5:00pm')).toBe('17:00');
    expect(parseFlexibleTime('8:45pm')).toBe('20:45');
    expect(parseFlexibleTime('1:30pm')).toBe('13:30');
  });

  it('tolerates spacing, case, and dotted meridiems', () => {
    expect(parseFlexibleTime('6:30 AM')).toBe('06:30');
    expect(parseFlexibleTime(' 6:30 a.m. ')).toBe('06:30');
    expect(parseFlexibleTime('8:45 PM')).toBe('20:45');
    expect(parseFlexibleTime('6:30:00 pm')).toBe('18:30');
  });

  it('handles the noon/midnight edges', () => {
    expect(parseFlexibleTime('12:00pm')).toBe('12:00');
    expect(parseFlexibleTime('12:15am')).toBe('00:15');
  });

  it('accepts plain 24h times', () => {
    expect(parseFlexibleTime('06:30')).toBe('06:30');
    expect(parseFlexibleTime('18:00')).toBe('18:00');
  });

  it('rejects anything that is not a clock time', () => {
    expect(parseFlexibleTime('+10m')).toBeNull();
    expect(parseFlexibleTime('')).toBeNull();
    expect(parseFlexibleTime(null)).toBeNull();
    expect(parseFlexibleTime('nope')).toBeNull();
    expect(parseFlexibleTime('13:00pm')).toBeNull();
    expect(parseFlexibleTime('6:75am')).toBeNull();
  });
});

describe('datoToIqamah', () => {
  it('maps the website times and skips Maghrib (+10m)', () => {
    const r = datoToIqamah({
      fajrTime: '6:30am',
      dhuhrTime: '2:00pm',
      asrTime: '5:00pm',
      maghribTime: '+10m',
      ishaTime: '8:45pm',
      jumAhTime: '1:30pm',
    });
    expect(r).toEqual({
      iqamah: { Fajr: '06:30', Dhuhr: '14:00', Asr: '17:00', Isha: '20:45' },
      jummah: '13:30',
    });
    expect(r?.iqamah.Maghrib).toBeUndefined();
  });

  it('keeps whatever parses when a field is blank or malformed', () => {
    const r = datoToIqamah({ fajrTime: '6:30am', dhuhrTime: '', asrTime: null, ishaTime: 'tbd' });
    expect(r).toEqual({ iqamah: { Fajr: '06:30' }, jummah: undefined });
  });

  it('returns null when nothing is usable', () => {
    expect(datoToIqamah({ fajrTime: '', ishaTime: null })).toBeNull();
    expect(datoToIqamah(null)).toBeNull();
  });
});
