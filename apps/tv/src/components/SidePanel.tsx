import { type ReactElement } from 'react';
import { color, font } from '../theme/tokens';
import { Girih } from './Girih';
import { QrCode } from './QrCode';
import { MonthSchedule } from './MonthSchedule';
import type { Slide } from '../domain/content';

export type SidePanelMode = 'announcements' | 'qr' | 'both';

interface SidePanelProps {
  mode: SidePanelMode;
  slides?: Slide[];
  activeIndex?: number;
  /** Donate link — rendered as a real scannable QR when present. */
  donateUrl?: string;
  /** For the QR: a short call to action. */
  donateLabel?: string;
  /** "YYYY-MM-DD" of today — highlights today's row in the month schedule. */
  todayDate?: string;
}

/** A placeholder QR glyph — finder squares + a deterministic fill (real codes arrive in Phase 4). */
function FauxQR({ size = 200 }: { size?: number }) {
  const n = 11;
  const cell = size / n;
  const inFinder = (x: number, y: number) => x === 0 || x === 2 || y === 0 || y === 2 || (x === 1 && y === 1);
  const cells: ReactElement[] = [];
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      let on: boolean;
      if (x < 3 && y < 3) on = inFinder(x, y);
      else if (x >= n - 3 && y < 3) on = inFinder(x - (n - 3), y);
      else if (x < 3 && y >= n - 3) on = inFinder(x, y - (n - 3));
      else on = (x * 7 + y * 5 + x * y * 3) % 3 === 0;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} style={{ fill: color.nightLapis }} />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {cells}
    </svg>
  );
}

function SectionHeader({ label, tint = color.announce }: { label: string; tint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <Girih size={15} color={tint} />
      <span style={{ font: `700 18px ${font.body}`, letterSpacing: '0.26em', color: tint }}>{label}</span>
    </div>
  );
}

/** The toggleable side region: announcements slideshow, donate QR, or both stacked. */
export function SidePanel({ mode, slides = [], activeIndex = 0, donateUrl, donateLabel = 'Scan to donate', todayDate }: SidePanelProps) {
  const current = slides[activeIndex];
  const showAnn = (mode === 'announcements' || mode === 'both') && !!current;
  const showQr = mode === 'qr' || mode === 'both';
  const stacked = showAnn && showQr;

  return (
    <aside
      style={{
        height: '100%',
        borderRadius: 28,
        border: `1px solid color-mix(in srgb, ${color.plaster} 10%, transparent)`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0))',
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
      }}
    >
      {showAnn && current && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <SectionHeader
            label={
              current.kind === 'month'
                ? (current.month?.label ?? 'This Month').toUpperCase()
                : current.kind === 'event'
                  ? 'UPCOMING EVENT'
                  : 'ANNOUNCEMENTS'
            }
          />
          {current.kind === 'month' && current.month ? (
            <MonthSchedule days={current.month.days} todayDate={todayDate} compact={stacked} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
              <div style={{ font: `400 ${stacked ? 38 : 44}px ${font.display}`, color: color.plaster, lineHeight: 1.25 }}>
                {current.text}
              </div>
              {current.cta && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    padding: '8px 18px',
                    borderRadius: 999,
                    border: `1px solid color-mix(in srgb, ${color.brass} 55%, transparent)`,
                    font: `600 22px ${font.body}`,
                    color: color.brass,
                  }}
                >
                  {current.cta}
                </div>
              )}
            </div>
          )}
          {slides.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {slides.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === activeIndex ? 26 : 9,
                    height: 9,
                    borderRadius: 999,
                    background: i === activeIndex ? color.brass : `color-mix(in srgb, ${color.plaster} 20%, transparent)`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {stacked && (
        <div style={{ height: 1, background: `color-mix(in srgb, ${color.plaster} 10%, transparent)` }} />
      )}

      {showQr &&
        (stacked ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ padding: 12, borderRadius: 16, background: color.plaster, flexShrink: 0 }}>
              {donateUrl ? <QrCode value={donateUrl} size={148} /> : <FauxQR size={148} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ font: `700 16px ${font.body}`, letterSpacing: '0.2em', color: color.donate }}>SUPPORT THE MASJID</span>
              <span style={{ font: `400 26px ${font.body}`, color: color.plaster }}>{donateLabel}</span>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
            <SectionHeader label="SUPPORT THE MASJID" tint={color.donate} />
            <div style={{ padding: 20, borderRadius: 20, background: color.plaster }}>
              {donateUrl ? <QrCode value={donateUrl} size={260} /> : <FauxQR size={260} />}
            </div>
            <span style={{ font: `400 30px ${font.body}`, color: color.plasterDim }}>{donateLabel}</span>
          </div>
        ))}
    </aside>
  );
}
