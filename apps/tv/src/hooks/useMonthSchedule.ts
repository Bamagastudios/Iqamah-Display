import { useEffect, useState } from 'react';
import { fetchMonthSchedule, type MonthDay } from '../api/monthSchedule';

const KEY = 'masjidtv.month.v1';

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function readCache(key: string): MonthDay[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { key: string; days: MonthDay[] };
    return parsed.key === key && Array.isArray(parsed.days) ? parsed.days : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, days: MonthDay[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ key, days }));
  } catch {
    /* ignore quota/availability */
  }
}

/**
 * The current month's iqamah schedule. Hydrates from cache instantly, fetches the
 * month in the background, and only refetches when the calendar month changes.
 * Returns [] until data is available (callers skip the schedule when empty).
 */
export function useMonthSchedule(now: Date): MonthDay[] {
  const key = monthKey(now);
  const [rows, setRows] = useState<MonthDay[]>(() => readCache(key) ?? []);

  useEffect(() => {
    let active = true;
    const ac = new AbortController();
    const cached = readCache(key);
    if (cached) setRows(cached);

    fetchMonthSchedule(now, ac.signal)
      .then((days) => {
        if (!active || days.length === 0) return;
        setRows(days);
        writeCache(key, days);
      })
      .catch(() => {
        /* keep cache/empty on failure */
      });

    return () => {
      active = false;
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return rows;
}
