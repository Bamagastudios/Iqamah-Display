import type { PrayerTimesResponse } from '../api/types';

/**
 * Admin-set iqāmah backup. Iqāmah times are the ones a masjid fixes by hand (the feed's
 * adhān shifts daily and is astronomical, so it is never overridden). Used as a safety
 * net when the live feed is unreachable ('backup') or as a hard override ('always').
 */
export type ManualMode = 'off' | 'backup' | 'always';

export interface ManualTimes {
  mode: ManualMode;
  /** Iqāmah "HH:mm" (24h) keyed by prayer name. Maghrib is ignored — see maghribOffsetMin. */
  iqamah: Record<string, string>;
  /** Jummah iqāmah "HH:mm". */
  jummah?: string;
  /** Maghrib iqāmah is always adhān + this many minutes (its adhān shifts daily). */
  maghribOffsetMin?: number;
}

/** Default minutes after Maghrib adhān for its iqāmah. */
export const DEFAULT_MAGHRIB_OFFSET_MIN = 10;

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
    if (p.name === 'Maghrib') return p; // Maghrib iqāmah is always adhān + offset (enforceMaghribOffset)
    const iq = manual.iqamah?.[p.name];
    return iq ? { ...p, iqamah: iq, iqamah12: to12h(iq) } : p;
  });
  const jummah = manual.jummah ? { iqamah: manual.jummah, iqamah12: to12h(manual.jummah) } : base.jummah;
  const dateFields = opts.live ? {} : todayFields(opts.now);

  return { ...base, ...dateFields, prayers, jummah };
}

/** Add `min` minutes to an "HH:mm" (24h) time, wrapping within the day. */
export function addMinutesHHMM(hhmm: string, min: number): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm ?? '').trim());
  if (!m) return hhmm;
  const total = ((Number(m[1]) * 60 + Number(m[2]) + min) % 1440 + 1440) % 1440;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(total / 60))}:${p(total % 60)}`;
}

/**
 * Maghrib's iqāmah is always its adhān + a fixed offset — its adhān follows sunset and
 * shifts daily, so a fixed clock time (from the feed or the manual list) would drift.
 * Applied unconditionally so the rule holds in every mode.
 */
export function enforceMaghribOffset(base: PrayerTimesResponse, offsetMin = DEFAULT_MAGHRIB_OFFSET_MIN): PrayerTimesResponse {
  const prayers = base.prayers.map((p) => {
    if (p.name !== 'Maghrib' || !p.adhan) return p;
    const iqamah = addMinutesHHMM(p.adhan, offsetMin);
    return { ...p, iqamah, iqamah12: to12h(iqamah) };
  });
  return { ...base, prayers };
}

/**
 * The full iqāmah pipeline, shared by the board and the upcoming-days schedule so they can
 * never disagree: manual backup (per its mode) → DatoCMS (always, when available) →
 * Maghrib pinned to adhān + offset. Pass `live: true` for days fetched from the API so their
 * own date is kept.
 */
export function resolveIqamah(
  base: PrayerTimesResponse,
  opts: { manual?: ManualTimes; dato?: ManualTimes; maghribOffsetMin?: number; live: boolean; now: Date },
): PrayerTimesResponse {
  const at = { live: opts.live, now: opts.now };
  const withManual = applyManualTimes(base, opts.manual, at);
  const withDato = applyManualTimes(withManual, opts.dato, at);
  return enforceMaghribOffset(withDato, opts.maghribOffsetMin);
}
