import type { PrayerTimesResponse } from './types';

/**
 * The unified MasjidTV feed: GET /api/display on the masjid's website.
 * One poll returns prayer times + announcements + events + a small theme hint.
 * No key, CORS open, ~30s freshness. Derived from the documented response shape.
 */

export interface FeedAnnouncement {
  text: string;
  /** Site-relative link (informational on a non-tappable TV). */
  href?: string | null;
  button?: { label: string; href: string } | null;
  /** Per-slide display duration; null → use the default rotation cadence. */
  durationSeconds?: number | null;
}

export interface FeedEventSession {
  date: string; // "2026-06-25"
  time: string; // "4:00–6:00 PM"
}

export interface FeedEvent {
  title: string;
  slug?: string;
  summary?: string;
  status?: string;
  registerUrl?: string | null;
  location?: string | null;
  sessions?: FeedEventSession[];
}

/** Small theme hint from the website (full branding comes from our own config). */
export interface FeedTheme {
  barColor?: string | null;
  barTextColor?: string | null;
}

export interface DisplayFeed {
  updatedAt: string;
  theme: FeedTheme;
  announcements: FeedAnnouncement[];
  upcomingEvents: FeedEvent[];
  prayerTimes: PrayerTimesResponse;
}

const DEFAULT_URL = 'https://tajweedusa.org/api/display';

export function displayFeedUrl(): string {
  return import.meta.env.VITE_DISPLAY_FEED ?? DEFAULT_URL;
}

function isDisplayFeed(value: unknown): value is DisplayFeed {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  const pt = o.prayerTimes as Record<string, unknown> | undefined;
  return (
    !!pt &&
    typeof pt === 'object' &&
    Array.isArray(pt.prayers) &&
    pt.prayers.length > 0 &&
    typeof pt.date === 'string'
  );
}

/**
 * Fetch + validate the unified feed. Throws on network error / non-2xx / bad shape so
 * callers keep last-known-good. Defensively normalizes the array fields.
 */
export async function fetchDisplayFeed(signal?: AbortSignal): Promise<DisplayFeed> {
  const res = await fetch(displayFeedUrl(), { signal, headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Display feed responded ${res.status}`);

  const json: unknown = await res.json();
  if (!isDisplayFeed(json)) throw new Error('Display feed returned an unexpected shape');

  const feed = json as DisplayFeed;
  if (!Array.isArray(feed.announcements)) feed.announcements = [];
  if (!Array.isArray(feed.upcomingEvents)) feed.upcomingEvents = [];
  if (!feed.theme) feed.theme = {};
  if (!Array.isArray(feed.prayerTimes.alerts)) feed.prayerTimes.alerts = [];
  return feed;
}
