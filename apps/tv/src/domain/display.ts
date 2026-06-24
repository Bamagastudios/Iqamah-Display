import type { PrayerTimesResponse } from '../api/types';

/** Arabic names for the prayers + sunrise + Jummah (used for display only). */
export const ARABIC_NAME: Record<string, string> = {
  fajr: 'الفجر',
  shurooq: 'الشروق',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
  jummah: 'الجمعة',
};

export function arabicFor(name: string): string {
  return ARABIC_NAME[name.toLowerCase()] ?? '';
}

export interface DisplayRow {
  /** Stable key — matches a prayer `name`, or "Shurooq". */
  key: string;
  name: string;
  arabic: string;
  /** Adhan time, 12h (prayers only). */
  adhan?: string;
  /** Iqamah time, 12h (prayers only). */
  iqamah?: string;
  /** A single time, 12h (Shurooq has no iqamah). */
  single?: string;
  kind: 'prayer' | 'sunrise';
}

/**
 * The five daily prayers, in order: Fajr · Dhuhr · Asr · Maghrib · Isha.
 * Shurooq (sunrise) and the fixed Jummah are shown separately, below the
 * daily five (see SecondaryTimes), so the core five stay visually together.
 */
export function buildDisplayRows(resp: PrayerTimesResponse): DisplayRow[] {
  return resp.prayers.map((p) => ({
    key: p.name,
    name: p.displayName ?? p.name,
    arabic: arabicFor(p.name),
    adhan: p.adhan12,
    iqamah: p.iqamah12,
    kind: 'prayer' as const,
  }));
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "Monday, 22 June 2026" from the API's weekday + date. */
export function formatGregorian(resp: PrayerTimesResponse): string {
  const [y, m, d] = resp.date.split('-').map(Number);
  return `${resp.weekday}, ${d} ${MONTHS[m - 1]} ${y}`;
}
