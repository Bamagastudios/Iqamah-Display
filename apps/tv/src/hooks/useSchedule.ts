import { useEffect, useState } from 'react';
import { fetchSchedule, type MonthDay } from '../api/monthSchedule';

const KEY = 'masjidtv.schedule.v1';

function dayStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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
 * The next `days` days of iqamah times (a rolling window starting today). Hydrates
 * from cache instantly, fetches in the background, and refetches when the day rolls
 * over. Returns [] until data is available (callers skip the schedule when empty).
 */
export function useSchedule(now: Date, days = 14): MonthDay[] {
  const key = `${dayStamp(now)}:${days}`;
  const [rows, setRows] = useState<MonthDay[]>(() => readCache(key) ?? []);

  useEffect(() => {
    let active = true;
    const ac = new AbortController();
    const cached = readCache(key);
    if (cached) setRows(cached);

    fetchSchedule(now, days, ac.signal)
      .then((result) => {
        if (!active || result.length === 0) return;
        setRows(result);
        writeCache(key, result);
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
