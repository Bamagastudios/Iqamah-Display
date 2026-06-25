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

/** Every "YYYY-MM-DD" in the month containing `ref`. */
export function monthDates(ref: Date): string[] {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => `${y}-${pad(m + 1)}-${pad(i + 1)}`);
}

export function monthDayFromResponse(date: string, pt: PrayerTimesResponse): MonthDay {
  const [y, m, d] = date.split('-').map(Number);
  const iqamah = ORDER.map((key) => pt.prayers.find((p) => p.name.toLowerCase() === key)?.iqamah12 ?? '—');
  return { date, day: d, dow: DOW[new Date(y, m - 1, d).getDay()], isFriday: !!pt.isFriday, iqamah };
}

/**
 * Iqamah times for every day of `ref`'s month — one request per day to the real
 * /api/prayer-times?date=… (proxied same-origin). Resilient: days that fail are
 * dropped rather than failing the whole month.
 */
export async function fetchMonthSchedule(ref: Date, signal?: AbortSignal): Promise<MonthDay[]> {
  const base = prayerApiUrl();
  const settled = await Promise.allSettled(
    monthDates(ref).map(async (date) => {
      const res = await fetch(`${base}?date=${date}`, { signal, headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`prayer-times ${date} -> ${res.status}`);
      return monthDayFromResponse(date, (await res.json()) as PrayerTimesResponse);
    }),
  );
  return settled.flatMap((s) => (s.status === 'fulfilled' ? [s.value] : []));
}
