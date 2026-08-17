import type { PrayerTimesResponse } from '../api/types';

/**
 * Admin-set iqāmah backup. Iqāmah times are the ones a masjid fixes by hand (the feed's
 * adhān shifts daily and is astronomical, so it is never overridden). Used as a safety
 * net when the live feed is unreachable ('backup') or as a hard override ('always').
 */
export type ManualMode = 'off' | 'backup' | 'always';

export interface ManualTimes {
  mode: ManualMode;
  /** Iqāmah "HH:mm" (24h) keyed by prayer name: Fajr, Dhuhr, Asr, Maghrib, Isha. */
  iqamah: Record<string, string>;
  /** Jummah iqāmah "HH:mm". */
  jummah?: string;
}

/** "HH:mm" (24h) → "h:mm AM/PM". Returns the input unchanged if it isn't parseable. */
export function to12h(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm ?? '').trim());
  if (!m) return hhmm;
  let h = Number(m[1]);
  if (h > 23 || Number(m[2]) > 59) return hhmm;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m[2]} ${ampm}`;
}

function applies(mode: ManualMode, live: boolean): boolean {
  if (mode === 'always') return true;
  if (mode === 'backup') return !live; // only when the live fetch failed
  return false;
}

function todayFields(now: Date): Pick<PrayerTimesResponse, 'date' | 'weekday' | 'isFriday'> {
  const p = (n: number) => String(n).padStart(2, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return {
    date: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`,
    weekday: days[now.getDay()],
    isFriday: now.getDay() === 5,
  };
}

/**
 * Overlay the admin's manual iqāmah times onto the live/cached prayer data.
 *   - 'off'    → never; returns `base` untouched (zero overhead — same reference).
 *   - 'backup' → only when `live` is false (fetch failed, we're on cache/sample), so the
 *     board still shows the right iqāmah during an outage.
 *   - 'always' → always, overriding the feed's iqāmah (use when the feed is wrong).
 * Adhān is never changed. When applied while not live, the date is re-anchored to `now`
 * so the countdown targets today (cache/sample may carry a stale date).
 */
export function applyManualTimes(
  base: PrayerTimesResponse,
  manual: ManualTimes | null | undefined,
  opts: { live: boolean; now: Date },
): PrayerTimesResponse {
  if (!manual || !applies(manual.mode, opts.live)) return base;

  const prayers = base.prayers.map((p) => {
    const iq = manual.iqamah?.[p.name];
    return iq ? { ...p, iqamah: iq, iqamah12: to12h(iq) } : p;
  });
  const jummah = manual.jummah ? { iqamah: manual.jummah, iqamah12: to12h(manual.jummah) } : base.jummah;
  const dateFields = opts.live ? {} : todayFields(opts.now);

  return { ...base, ...dateFields, prayers, jummah };
}
