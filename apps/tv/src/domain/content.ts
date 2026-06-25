import type { DisplayFeed, FeedEvent, FeedEventSession } from '../api/displayFeed';
import type { MonthDay } from '../api/monthSchedule';

/** A single rotating side-panel slide (announcement, folded-in event, or a month-schedule page). */
export interface Slide {
  text?: string;
  /** Optional call-to-action label (e.g. "Learn more", "Register"). */
  cta?: string;
  /** Per-slide duration in seconds; null → default cadence. */
  durationSeconds?: number | null;
  kind: 'announcement' | 'event' | 'month';
  /** Present when kind === 'month' — one page of the month schedule. */
  month?: { days: MonthDay[]; label: string };
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOW[dt.getDay()]} ${d} ${MON[m - 1]}`;
}

/** The event whose soonest session is today or later, earliest first. */
export function nextEvent(events: FeedEvent[], now: Date): { event: FeedEvent; session: FeedEventSession } | null {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  let best: { event: FeedEvent; session: FeedEventSession; t: number } | null = null;
  for (const event of events) {
    for (const session of event.sessions ?? []) {
      const [y, m, d] = session.date.split('-').map(Number);
      const t = new Date(y, m - 1, d).getTime();
      if (t >= today && (!best || t < best.t)) best = { event, session, t };
    }
  }
  return best ? { event: best.event, session: best.session } : null;
}

function eventSlide(event: FeedEvent, session: FeedEventSession): Slide {
  const where = event.location ? ` · ${event.location}` : '';
  return {
    text: `${event.title} — ${shortDate(session.date)} · ${session.time}${where}`,
    cta: event.registerUrl ? 'Register' : undefined,
    kind: 'event',
  };
}

/** The slideshow: website announcements, with the next upcoming event folded in as a slide. */
export function buildSlides(feed: DisplayFeed, now: Date): Slide[] {
  const slides: Slide[] = feed.announcements.map((a) => ({
    text: a.text,
    cta: a.button?.label ?? undefined,
    durationSeconds: a.durationSeconds ?? null,
    kind: 'announcement' as const,
  }));
  const ne = nextEvent(feed.upcomingEvents, now);
  if (ne) slides.push(eventSlide(ne.event, ne.session));
  return slides;
}

/** The upcoming-iqamah schedule as a single rotating side-panel slide. */
export function buildScheduleSlide(rows: MonthDay[]): Slide[] {
  if (rows.length === 0) return [];
  return [{ kind: 'month', durationSeconds: 12, month: { days: rows, label: 'Upcoming · Iqāmah' } }];
}
