import { createRoot } from 'react-dom/client';
import './theme/fonts';
import './theme/global.css';
import { Display } from './components/Display';
import type { SidePanelMode } from './components/SidePanel';
import { applyTheme, EMERALD_THEME } from './theme/theme';
import { SAMPLE_FEED } from './fixtures';
import { buildSlides, buildScheduleSlide } from './domain/content';
import { scheduleDates, type MonthDay } from './api/monthSchedule';

const params = new URLSearchParams(window.location.search);

// Fixed "now" for a deterministic screenshot: 2026-06-22 17:47:13 → Maghrib is next.
// ?at=adhan|iqamah|inprogress|night jumps to a moment so the always-on states show.
// (Sample Maghrib: adhān 20:24, iqāmah 20:34; Isha iqāmah 22:00; Fajr adhān 05:05.)
const MOMENTS: Record<string, Date> = {
  adhan: new Date(2026, 5, 22, 20, 28, 0),
  iqamah: new Date(2026, 5, 22, 20, 34, 30),
  inprogress: new Date(2026, 5, 22, 20, 38, 0),
  night: new Date(2026, 5, 22, 2, 0, 0),
};
const now = MOMENTS[params.get('at') ?? ''] ?? new Date(2026, 5, 22, 17, 47, 13);
const todayDate = '2026-06-22';

// ?panel=qr | announcements | both | off
const panel = params.get('panel');
const sidePanel: SidePanelMode | 'off' =
  panel === 'qr' ? 'qr' : panel === 'announcements' ? 'announcements' : panel === 'off' ? 'off' : 'both';

// ?theme=emerald — proves the whole board re-skins from config.
if (params.get('theme') === 'emerald') applyTheme(document.documentElement, EMERALD_THEME);

// ?demo=split — paint each region a distinct color to prove they're independent.
if (params.get('demo') === 'split') {
  const root = document.documentElement.style;
  root.setProperty('--c-niche', '#E0653A'); // mihrab → orange
  root.setProperty('--c-announce', '#8B5CF6'); // announcements → purple
  root.setProperty('--c-donate', '#10B981'); // support → green
  root.setProperty('--c-jummah', '#EAB308'); // Jummah → amber
}

// ?motion=off — preview the reduced-motion / low-power static state.
const ambientMotion = params.get('motion') !== 'off';

// A sample month (reuses today's sample iqamah times for every day) so the
// 30-day schedule can be previewed without the live API.
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const sampleIqamah = SAMPLE_FEED.prayerTimes.prayers.map((p) => p.iqamah12);
const scheduleRows: MonthDay[] = scheduleDates(now, 10).map((date) => {
  const [y, m, d] = date.split('-').map(Number);
  const dow = DOW[new Date(y, m - 1, d).getDay()];
  return { date, day: d, dow, isFriday: dow === 'Fri', iqamah: sampleIqamah };
});

const feedSlides = buildSlides(SAMPLE_FEED, now);
const slides = [...feedSlides, ...buildScheduleSlide(scheduleRows)];

// ?slide=month → jump to the schedule slide (default: announcements).
const startIndex = params.get('slide') === 'month' ? feedSlides.length : 0;

createRoot(document.getElementById('preview')!).render(
  <Display
    data={SAMPLE_FEED.prayerTimes}
    now={now}
    masjidName="Tajweed Institute"
    sidePanel={sidePanel}
    slides={slides}
    announcementIndex={startIndex}
    donateUrl="https://tajweedusa.org/donate"
    ambientMotion={ambientMotion}
    todayDate={todayDate}
  />,
);
