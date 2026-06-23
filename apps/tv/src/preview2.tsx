import { createRoot } from 'react-dom/client';
import './theme/fonts';
import './theme/global.css';
import { Display } from './components/Display';
import type { SidePanelMode } from './components/SidePanel';
import { applyTheme, EMERALD_THEME } from './theme/theme';
import { SAMPLE_RESPONSE } from './fixtures';
import { SAMPLE_ANNOUNCEMENTS } from './fixtures/sampleAnnouncements';

// Fixed "now" for a deterministic screenshot: 2026-06-22 17:47:13 → Maghrib is next.
const now = new Date(2026, 5, 22, 17, 47, 13);

const params = new URLSearchParams(window.location.search);

// ?panel=qr | announcements | both | off
const panel = params.get('panel');
const sidePanel: SidePanelMode | 'off' =
  panel === 'qr' ? 'qr' : panel === 'announcements' ? 'announcements' : panel === 'off' ? 'off' : 'both';

// ?theme=emerald — proves the whole board re-skins from config.
if (params.get('theme') === 'emerald') applyTheme(document.documentElement, EMERALD_THEME);

// ?motion=off — preview the reduced-motion / low-power static state.
const ambientMotion = params.get('motion') !== 'off';

createRoot(document.getElementById('preview')!).render(
  <Display
    data={SAMPLE_RESPONSE}
    now={now}
    masjidName="Tajweed Institute"
    sidePanel={sidePanel}
    announcements={SAMPLE_ANNOUNCEMENTS}
    announcementIndex={0}
    ambientMotion={ambientMotion}
  />,
);
