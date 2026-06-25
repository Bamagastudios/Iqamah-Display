import { useEffect, useMemo, useState } from 'react';
import './theme/fonts';
import './theme/global.css';
import { useClock } from './hooks/useClock';
import { useDisplayData } from './hooks/useDisplayData';
import { useConfig } from './hooks/useConfig';
import { useSchedule } from './hooks/useSchedule';
import { buildSlides, buildScheduleSlide } from './domain/content';
import { burnInOffset } from './domain/ambient';
import { Display } from './components/Display';
import { Stage } from './components/Stage';

const DEFAULT_SLIDE_SECONDS = 12;

/**
 * The TV display. Merges two sources: content from the website /api/display feed
 * (prayer times + announcements + events) and branding/config from Supabase
 * (applied as the theme). Both degrade to cached/default values, never blanking.
 */
export default function App() {
  const now = useClock(1000);
  const { feed, stale } = useDisplayData();
  const cfg = useConfig(); // applies theme as a side effect + returns display props
  const scheduleRows = useSchedule(now, 10); // next 10 days of iqamah times (rolling, cached)

  // Slides only change when the feed, the schedule, or the calendar day changes —
  // keep them stable across the 1s clock tick so the rotation timer isn't reset.
  const p2 = (n: number) => String(n).padStart(2, '0');
  const todayDate = `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`;
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const slides = useMemo(
    () => [...buildSlides(feed, now), ...buildScheduleSlide(scheduleRows)],
    [feed, scheduleRows, dayKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

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

  // Pick up new code deploys on their own: reload once in the quiet early morning.
  // (Content & branding from the admin already update live via polling.)
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      if (d.getHours() === 3 && d.getMinutes() < 5) window.location.reload();
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Stage offset={burnInOffset(now)}>
      <Display
        data={feed.prayerTimes}
        now={now}
        masjidName={cfg.masjidName ?? 'Tajweed Institute'}
        logoUrl={cfg.logoUrl}
        sidePanel={cfg.sidePanel ?? 'both'}
        slides={slides}
        announcementIndex={idx}
        donateUrl={cfg.donateUrl}
        ambientMotion={cfg.ambientMotion ?? true}
        alertEnabled={cfg.alertEnabled}
        alertText={cfg.alertText}
        stale={stale}
        todayDate={todayDate}
        nightDim={cfg.nightDim ?? true}
        prayerMoments={cfg.prayerMoments ?? true}
      />
    </Stage>
  );
}
