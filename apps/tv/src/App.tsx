import { useEffect, useMemo, useState } from 'react';
import './theme/fonts';
import './theme/global.css';
import { useClock } from './hooks/useClock';
import { useDisplayData } from './hooks/useDisplayData';
import { buildSlides } from './domain/content';
import { Display } from './components/Display';

const DEFAULT_SLIDE_SECONDS = 12;

/**
 * The TV display. Reads the unified /api/display feed (prayer times + announcements +
 * events), folds the next event into the slideshow, and renders the full board.
 * Branding/theme will come from our own config layer (Supabase) next.
 */
export default function App() {
  const now = useClock(1000);
  const { feed, stale } = useDisplayData();

  // Slides only change when the feed or the calendar day changes — keep them stable
  // across the 1s clock tick so the rotation timer isn't reset every second.
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const slides = useMemo(() => buildSlides(feed, now), [feed, dayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx((i) => (slides.length ? i % slides.length : 0));
  }, [slides.length]);
  useEffect(() => {
    if (slides.length <= 1) return;
    const secs = slides[idx]?.durationSeconds ?? DEFAULT_SLIDE_SECONDS;
    const ms = Math.max(4000, (secs || DEFAULT_SLIDE_SECONDS) * 1000);
    const id = setTimeout(() => setIdx((i) => (i + 1) % slides.length), ms);
    return () => clearTimeout(id);
  }, [idx, slides]);

  return (
    <Display
      data={feed.prayerTimes}
      now={now}
      masjidName="Tajweed Institute"
      sidePanel="both"
      slides={slides}
      announcementIndex={idx}
      stale={stale}
    />
  );
}
