import { type CSSProperties } from 'react';
import { color, font } from '../theme/tokens';
import type { PrayerTimesResponse } from '../api/types';
import { buildPrayerInstants, countdown, nextIqamah } from '../domain/schedule';
import { padCountdown } from '../domain/format';
import { arabicFor, buildDisplayRows, formatGregorian } from '../domain/display';
import type { Announcement } from '../fixtures/sampleAnnouncements';
import { DateBar } from './DateBar';
import { NextHero } from './NextHero';
import { PrayerTable } from './PrayerTable';
import { SidePanel, type SidePanelMode } from './SidePanel';

interface DisplayProps {
  data: PrayerTimesResponse;
  now: Date;
  masjidName?: string;
  /** 'off' hides the side region entirely (toggleable). */
  sidePanel?: SidePanelMode | 'off';
  announcements?: Announcement[];
  announcementIndex?: number;
  /** Marker shown when data is cached/sample rather than freshly fetched. */
  stale?: boolean;
}

const page: CSSProperties = {
  position: 'relative',
  width: 1920,
  height: 1080,
  overflow: 'hidden',
  background: `radial-gradient(120% 80% at 50% 116%, rgba(111,90,128,0.18) 0%, rgba(111,90,128,0) 46%), radial-gradient(90% 60% at 50% 110%, rgba(200,162,76,0.14) 0%, rgba(200,162,76,0) 52%), ${color.nightLapis}`,
  color: color.plaster,
  display: 'flex',
  flexDirection: 'column',
  padding: '40px 64px',
};

/** The full 1920×1080 TV board: date bar, next-prayer hero + countdown, the prayer table, and the side panel. */
export function Display({
  data,
  now,
  masjidName = 'Masjid',
  sidePanel = 'announcements',
  announcements = [],
  announcementIndex = 0,
  stale = false,
}: DisplayProps) {
  const instants = buildPrayerInstants(data);
  const next = nextIqamah(instants, now);
  const cd = next ? countdown(next.at, now) : null;
  const rows = buildDisplayRows(data);
  const nextPrayer = next ? data.prayers.find((p) => p.name === next.prayer) : undefined;

  return (
    <div style={page}>
      <DateBar masjidName={masjidName} gregorian={formatGregorian(data)} hijri={data.hijriLabel} />

      <div style={{ flex: 1, display: 'flex', gap: 48, marginTop: 24, minHeight: 0 }}>
        <div style={{ flex: '1 1 66%', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {next && cd && (
            <NextHero
              name={next.displayName}
              arabic={arabicFor(next.prayer)}
              iqamah12={nextPrayer?.iqamah12 ?? ''}
              countdown={padCountdown(cd)}
            />
          )}
          <PrayerTable rows={rows} activeKey={next?.prayer} jummahTime={data.jummah.iqamah12} />
        </div>

        {sidePanel !== 'off' && (
          <div style={{ flex: '1 1 34%', minWidth: 0 }}>
            <SidePanel mode={sidePanel} announcements={announcements} activeIndex={announcementIndex} />
          </div>
        )}
      </div>

      <footer style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', font: `400 20px ${font.body}`, color: color.plasterDim, minHeight: 24 }}>
        {stale && <span>offline · showing last update</span>}
      </footer>
    </div>
  );
}
