import { useEffect, useState } from 'react';
import './theme/fonts';
import './theme/global.css';
import { useClock } from './hooks/useClock';
import { usePrayerData } from './hooks/usePrayerData';
import { Display } from './components/Display';
import { SAMPLE_ANNOUNCEMENTS } from './fixtures/sampleAnnouncements';

const ROTATE_MS = 12_000;

/**
 * The TV display. Merges live prayer data with content (announcements are sample
 * data until the Supabase content layer lands in Phase 4) and renders the full board.
 */
export default function App() {
  const now = useClock(1000);
  const { data, stale } = usePrayerData();

  // Announcements rotation (placeholder content + cadence until Phase 4 config).
  const announcements = SAMPLE_ANNOUNCEMENTS;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (announcements.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % announcements.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [announcements.length]);

  return (
    <Display
      data={data}
      now={now}
      masjidName="Tajweed Institute"
      sidePanel="both"
      announcements={announcements}
      announcementIndex={idx}
      stale={stale}
    />
  );
}
