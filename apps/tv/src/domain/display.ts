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
 * The rows shown on the board, in order:
 * Fajr · Shurooq (sunrise) · Dhuhr · Asr · Maghrib · Isha.
 * Shurooq is inserted after Fajr and carries a single time (no iqamah).
 * Jummah is rendered separately as a fixed entry (see PrayerTable).
 */
export function buildDisplayRows(resp: PrayerTimesResponse): DisplayRow[] {
  const rows: DisplayRow[] = [];
  for (const p of resp.prayers) {
    rows.push({
      key: p.name,
      name: p.displayName ?? p.name,
      arabic: arabicFor(p.name),
      adhan: p.adhan12,
      iqamah: p.iqamah12,
      kind: 'prayer',
    });
    if (p.name.toLowerCase() === 'fajr') {
      rows.push({
        key: 'Shurooq',
        name: 'Shurooq',
        arabic: arabicFor('shurooq'),
        single: resp.sunrise12,
        kind: 'sunrise',
      });
    }
  }
  return rows;
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
