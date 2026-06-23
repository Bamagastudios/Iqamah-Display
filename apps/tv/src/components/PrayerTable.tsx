import { type CSSProperties } from 'react';
import { color, font, radius } from '../theme/tokens';
import type { DisplayRow } from '../domain/display';

interface PrayerTableProps {
  rows: DisplayRow[];
  activeKey?: string;
  /** Jummah iqamah time, 12h — shown as a fixed Friday entry. */
  jummahTime?: string;
}

const GRID: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 170px 170px', alignItems: 'center' };
const ROW_PAD = '10px 22px';
const numStyle = (size: number, c: string): CSSProperties => ({
  textAlign: 'right',
  font: `500 ${size}px ${font.body}`,
  fontVariantNumeric: 'tabular-nums',
  color: c,
});

/** The prayer board: Fajr · Shurooq · Dhuhr · Asr · Maghrib · Isha, with adhan + iqamah, plus fixed Jummah. */
export function PrayerTable({ rows, activeKey, jummahTime }: PrayerTableProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ ...GRID, padding: '0 22px 2px', font: `700 16px ${font.body}`, letterSpacing: '0.18em', color: color.plasterDim }}>
        <span />
        <span style={{ textAlign: 'right' }}>ADHAN</span>
        <span style={{ textAlign: 'right' }}>IQAMAH</span>
      </div>

      {rows.map((r) => {
        const active = r.key === activeKey;
        const isSun = r.kind === 'sunrise';
        return (
          <div
            key={r.key}
            style={{
              ...GRID,
              padding: ROW_PAD,
              borderRadius: radius.md,
              background: active ? 'rgba(200, 162, 76, 0.12)' : isSun ? 'transparent' : 'rgba(242, 233, 213, 0.03)',
              border: active ? `1px solid ${color.brass}` : '1px solid transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ font: `600 ${isSun ? 28 : 34}px ${font.display}`, color: isSun ? color.plasterDim : color.plaster }}>
                {r.name}
              </span>
              <span dir="rtl" lang="ar" style={{ font: `700 ${isSun ? 21 : 26}px ${font.arabic}`, color: color.plasterDim }}>
                {r.arabic}
              </span>
            </div>
            <span style={numStyle(30, color.plasterDim)}>{r.adhan ?? r.single ?? '—'}</span>
            <span style={numStyle(active ? 36 : 32, active ? color.brass : r.iqamah ? color.plaster : color.plasterDim)}>
              {r.iqamah ?? '—'}
            </span>
          </div>
        );
      })}

      {jummahTime && (
        <div
          style={{
            ...GRID,
            padding: ROW_PAD,
            borderRadius: radius.md,
            background: 'rgba(46, 142, 128, 0.10)',
            border: `1px solid rgba(46, 142, 128, 0.45)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ font: `600 34px ${font.display}`, color: color.plaster }}>Jummah</span>
            <span dir="rtl" lang="ar" style={{ font: `700 26px ${font.arabic}`, color: color.plasterDim }}>
              الجمعة
            </span>
            <span style={{ font: `700 14px ${font.body}`, letterSpacing: '0.18em', color: color.zellige }}>FRIDAY · FIXED</span>
          </div>
          <span style={numStyle(30, color.plasterDim)}>—</span>
          <span style={numStyle(32, color.zellige)}>{jummahTime}</span>
        </div>
      )}
    </div>
  );
}
