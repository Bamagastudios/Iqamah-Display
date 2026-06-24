import { color, font } from '../theme/tokens';
import { Girih } from './Girih';

interface DateBarProps {
  masjidName: string;
  gregorian: string;
  hijri: string;
  /** Live current time, split into the time and AM/PM so they can be sized differently. */
  clock: { time: string; ampm: string };
  /** Backend-uploaded logo (Phase 4). Falls back to a placeholder mark when absent. */
  logoUrl?: string;
}

/** Top bar: masjid logo/name (left) · live current time (center) · Gregorian & Hijri date (right). */
export function DateBar({ masjidName, gregorian, hijri, clock, logoUrl }: DateBarProps) {
  return (
    <header style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {logoUrl ? (
          <img src={logoUrl} alt="" style={{ height: 60, maxWidth: 260, objectFit: 'contain' }} />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              border: `1.5px solid ${color.brass}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Girih size={30} color={color.brass} />
          </div>
        )}
        <span style={{ font: `600 34px ${font.display}`, color: color.plaster }}>{masjidName}</span>
      </div>

      {/* live clock, centered on the bar regardless of the side widths */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
        }}
      >
        <span style={{ font: `500 54px ${font.body}`, fontVariantNumeric: 'tabular-nums', color: color.plaster }}>{clock.time}</span>
        <span style={{ font: `600 26px ${font.body}`, letterSpacing: '0.1em', color: color.plasterDim }}>{clock.ampm}</span>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: `500 30px ${font.body}`, color: color.plaster }}>{gregorian}</span>
        <span style={{ font: `400 26px ${font.body}`, color: color.brass }}>{hijri}</span>
      </div>
    </header>
  );
}
