import type { PrayerTimesResponse } from './types';
import { prayerApiUrl } from './prayerTimes';

/** One day's iqamah row for the month schedule. */
export interface MonthDay {
  date: string; // "YYYY-MM-DD"
  day: number; // 1..31
  dow: string; // "Fri"
  isFriday: boolean;
  /** Iqamah, 12h, in order: Fajr, Dhuhr, Asr, Maghrib, Isha. */
  iqamah: string[];
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const pad = (n: number) => String(n).padStart(2, '0');

/** The next `days` "YYYY-MM-DD" starting from `ref`'s day (a rolling window). */
export function scheduleDates(ref: Date, days: number): string[] {
  const base = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
}

export function monthDayFromResponse(date: string, pt: PrayerTimesResponse): MonthDay {
  const [y, m, d] = date.split('-').map(Number);
  const iqamah = ORDER.map((key) => pt.prayers.find((p) => p.name.toLowerCase() === key)?.iqamah12 ?? '—');
  return { date, day: d, dow: DOW[new Date(y, m - 1, d).getDay()], isFriday: !!pt.isFriday, iqamah };
}

/**
 * Iqamah times for the next `days` days from today — one request per day to the
 * real /api/prayer-times?date=… (proxied same-origin). Resilient: days that fail
 * are dropped rather than failing the whole window.
 */
export async function fetchSchedule(ref: Date, days: number, signal?: AbortSignal): Promise<MonthDay[]> {
  const base = prayerApiUrl();
  const settled = await Promise.allSettled(
    scheduleDates(ref, days).map(async (date) => {
      const res = await fetch(`${base}?date=${date}`, { signal, headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`prayer-times ${date} -> ${res.status}`);
      return monthDayFromResponse(date, (await res.json()) as PrayerTimesResponse);
    }),
  );
  return settled.flatMap((s) => (s.status === 'fulfilled' ? [s.value] : []));
}
