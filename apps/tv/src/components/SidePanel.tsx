import { type ReactElement } from 'react';
import { color, font } from '../theme/tokens';
import { Girih } from './Girih';
import type { Announcement } from '../fixtures/sampleAnnouncements';

export type SidePanelMode = 'announcements' | 'qr';

interface SidePanelProps {
  mode: SidePanelMode;
  announcements?: Announcement[];
  activeIndex?: number;
  /** For the QR mode: a short call to action. */
  donateLabel?: string;
}

/** A placeholder QR glyph — finder squares + a deterministic fill (real codes arrive in Phase 4). */
function FauxQR({ size = 260 }: { size?: number }) {
  const n = 11;
  const cell = size / n;
  // A 3x3 finder block: outer ring + center dot.
  const inFinder = (x: number, y: number) => x === 0 || x === 2 || y === 0 || y === 2 || (x === 1 && y === 1);
  const cells: ReactElement[] = [];
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      let on: boolean;
      if (x < 3 && y < 3) on = inFinder(x, y);
      else if (x >= n - 3 && y < 3) on = inFinder(x - (n - 3), y);
      else if (x < 3 && y >= n - 3) on = inFinder(x, y - (n - 3));
      else on = (x * 7 + y * 5 + x * y * 3) % 3 === 0;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={color.nightLapis} />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {cells}
    </svg>
  );
}

/** The toggleable side region: an announcements slideshow, or a donate QR. */
export function SidePanel({ mode, announcements = [], activeIndex = 0, donateLabel = 'Scan to donate' }: SidePanelProps) {
  const current = announcements[activeIndex];
  return (
    <aside
      style={{
        height: '100%',
        borderRadius: 28,
        border: `1px solid rgba(242, 233, 213, 0.10)`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0))',
        padding: 44,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Girih size={16} color={color.zellige} />
        <span style={{ font: `700 20px ${font.body}`, letterSpacing: '0.26em', color: color.zellige }}>
          {mode === 'qr' ? 'SUPPORT THE MASJID' : 'ANNOUNCEMENTS'}
        </span>
      </div>

      {mode === 'announcements' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
          <div style={{ font: `600 48px ${font.display}`, color: color.plaster, lineHeight: 1.1 }}>{current?.title}</div>
          <div style={{ font: `400 30px ${font.body}`, color: color.plasterDim, lineHeight: 1.45 }}>{current?.body}</div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
          <div style={{ padding: 20, borderRadius: 20, background: color.plaster }}>
            <FauxQR size={260} />
          </div>
          <span style={{ font: `400 30px ${font.body}`, color: color.plasterDim }}>{donateLabel}</span>
        </div>
      )}

      {mode === 'announcements' && announcements.length > 1 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {announcements.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === activeIndex ? 28 : 10,
                height: 10,
                borderRadius: 999,
                background: i === activeIndex ? color.brass : 'rgba(242, 233, 213, 0.2)',
              }}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
