/**
 * TypeScript interfaces for the prayer-times API.
 *
 *   GET https://tajweed-website-beige.vercel.app/api/prayer-times
 *
 * Derived from the confirmed real response documented in docs/TRD.md and docs/PRD.md.
 * This API is consumed as-is and never modified. Times are masjid-local wall-clock
 * strings ("HH:mm" 24h, plus a 12h variant).
 */

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface HijriDate {
  year: number;
  month: number;
  monthName: string;
  day: number;
}

export interface Prayer {
  /** Canonical key, e.g. "Fajr" — stable; use for logic. */
  name: string;
  /** Label to show, e.g. "Fajr". Optional in the unified feed — defaults to `name`. */
  displayName?: string;
  /** Adhan time, 24h "HH:mm". */
  adhan: string;
  /** Iqamah time, 24h "HH:mm". */
  iqamah: string;
  /** Adhan time, 12h "h:mm AM/PM". */
  adhan12: string;
  /** Iqamah time, 12h "h:mm AM/PM". */
  iqamah12: string;
  isJummah: boolean;
}

export interface Jummah {
  /** Jummah iqamah, 24h "HH:mm". */
  iqamah: string;
  /** Jummah iqamah, 12h "h:mm AM/PM". */
  iqamah12: string;
}

/**
 * `alerts` shape is not yet populated by the API. Render defensively:
 * a string is shown as-is; an object may carry title/body/message.
 */
export type ApiAlert =
  | string
  | {
      title?: string;
      body?: string;
      message?: string;
      [key: string]: unknown;
    };

export interface PrayerTimesResponse {
  /** Present in the standalone prayer-times API; omitted in the unified /api/display feed. */
  location?: GeoLocation;
  /** "YYYY-MM-DD" — the calendar day these times belong to (anchor to this, not the device TZ). */
  date: string;
  /** "Monday" … */
  weekday: string;
  isFriday: boolean;
  /** Sunrise, 24h "HH:mm". */
  sunrise: string;
  /** Sunrise, 12h "h:mm AM/PM". */
  sunrise12: string;
  /** Present in the standalone API; the feed only sends `hijriLabel`. */
  hijri?: HijriDate;
  /** Ready-to-display, e.g. "8 Muharram 1448 AH". */
  hijriLabel: string;
  /** Ordered Fajr → Dhuhr → Asr → Maghrib → Isha. */
  prayers: Prayer[];
  jummah: Jummah;
  alerts: ApiAlert[];
}
