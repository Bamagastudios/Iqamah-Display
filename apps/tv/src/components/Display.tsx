import { type CSSProperties } from 'react';
import { color, font } from '../theme/tokens';
import type { PrayerTimesResponse } from '../api/types';
import { buildPrayerInstants, countdown, nextIqamah } from '../domain/schedule';
import { padCountdown } from '../domain/format';
import { arabicFor, buildDisplayRows, formatGregorian } from '../domain/display';
import type { Slide } from '../domain/content';
import { AmbientBackground } from './AmbientBackground';
import { DateBar } from './DateBar';
import { NextHero } from './NextHero';
import { PrayerTable } from './PrayerTable';
import { SidePanel, type SidePanelMode } from './SidePanel';

interface DisplayProps {
  data: PrayerTimesResponse;
  now: Date;
  masjidName?: string;
  logoUrl?: string;
  /** 'off' hides the side region entirely (toggleable). */
  sidePanel?: SidePanelMode | 'off';
  slides?: Slide[];
  announcementIndex?: number;
  /** Faint ambient motion; off → static gradient (reduced motion / low power). */
  ambientMotion?: boolean;
  /** Marker shown when data is cached/sample rather than freshly fetched. */
  stale?: boolean;
}

const page: CSSProperties = {
  position: 'relative',
  width: 1920,
  height: 1080,
  overflow: 'hidden',
  background: color.nightLapis,
  color: color.plaster,
};

const content: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '40px 64px',
};

/** The full 1920×1080 TV board: date bar, next-prayer hero + countdown, the prayer table, and the side panel. */
export function Display({
  data,
  now,
  masjidName = 'Masjid',
  logoUrl,
  sidePanel = 'both',
  slides = [],
  announcementIndex = 0,
  ambientMotion = true,
  stale = false,
}: DisplayProps) {
  const instants = buildPrayerInstants(data);
  const next = nextIqamah(instants, now);
  const cd = next ? countdown(next.at, now) : null;
  const rows = buildDisplayRows(data);
  const nextPrayer = next ? data.prayers.find((p) => p.name === next.prayer) : undefined;

  return (
    <div style={page}>
      <AmbientBackground enabled={ambientMotion} />

      <div style={content}>
        <DateBar masjidName={masjidName} gregorian={formatGregorian(data)} hijri={data.hijriLabel} logoUrl={logoUrl} />

        <div style={{ flex: 1, display: 'flex', gap: 48, marginTop: 22, minHeight: 0 }}>
          <div style={{ flex: '1 1 64%', display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
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
            <div style={{ flex: '1 1 36%', minWidth: 0 }}>
              <SidePanel mode={sidePanel} slides={slides} activeIndex={announcementIndex} />
            </div>
          )}
        </div>

        <footer style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', font: `400 20px ${font.body}`, color: color.plasterDim, minHeight: 22 }}>
          {stale && <span>offline · showing last update</span>}
        </footer>
      </div>
    </div>
  );
}
