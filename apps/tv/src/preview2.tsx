import { createRoot } from 'react-dom/client';
import './theme/fonts';
import './theme/global.css';
import { Display } from './components/Display';
import type { SidePanelMode } from './components/SidePanel';
import { SAMPLE_RESPONSE } from './fixtures';
import { SAMPLE_ANNOUNCEMENTS } from './fixtures/sampleAnnouncements';

// Fixed "now" for a deterministic screenshot: 2026-06-22 17:47:13 → Maghrib is next.
const now = new Date(2026, 5, 22, 17, 47, 13);

// ?panel=qr | announcements | off — lets us preview each side-panel mode.
const param = new URLSearchParams(window.location.search).get('panel');
const sidePanel: SidePanelMode | 'off' = param === 'qr' ? 'qr' : param === 'off' ? 'off' : 'announcements';

createRoot(document.getElementById('preview')!).render(
  <Display
    data={SAMPLE_RESPONSE}
    now={now}
    masjidName="Al-Noor Masjid"
    sidePanel={sidePanel}
    announcements={SAMPLE_ANNOUNCEMENTS}
    announcementIndex={0}
  />,
);
