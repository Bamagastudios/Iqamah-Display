import { type CSSProperties } from 'react';
import { color, font, radius } from '../theme/tokens';
import type { DisplayRow } from '../domain/display';

interface PrayerTableProps {
  rows: DisplayRow[];
  activeKey?: string;
}

const GRID: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 176px 190px', alignItems: 'center' };
const ROW_PAD = '13px 22px';
const numStyle = (size: number, c: string): CSSProperties => ({
  textAlign: 'right',
  font: `500 ${size}px ${font.body}`,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
  color: c,
});

/** The five daily prayers — Fajr · Dhuhr · Asr · Maghrib · Isha — with adhan + iqamah. */
export function PrayerTable({ rows, activeKey }: PrayerTableProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 920 }}>
      <div style={{ ...GRID, padding: '0 22px 2px', font: `700 17px ${font.body}`, letterSpacing: '0.18em', color: color.plasterDim }}>
        <span />
        <span style={{ textAlign: 'right' }}>ADHAN</span>
        <span style={{ textAlign: 'right' }}>IQAMAH</span>
      </div>

      {rows.map((r) => {
        const active = r.key === activeKey;
        return (
          <div
            key={r.key}
            style={{
              ...GRID,
              padding: ROW_PAD,
              borderRadius: radius.md,
              background: active
                ? `color-mix(in srgb, ${color.brass} 14%, transparent)`
                : `color-mix(in srgb, ${color.plaster} 4%, transparent)`,
              border: active ? `1px solid ${color.brass}` : '1px solid transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ font: `600 44px ${font.display}`, color: color.plaster }}>{r.name}</span>
              <span dir="rtl" lang="ar" style={{ font: `700 32px ${font.arabic}`, color: color.plasterDim }}>
                {r.arabic}
              </span>
            </div>
            <span style={numStyle(35, color.plasterDim)}>{r.adhan ?? r.single ?? '—'}</span>
            <span style={numStyle(active ? 40 : 38, active ? color.brass : r.iqamah ? color.plaster : color.plasterDim)}>
              {r.iqamah ?? '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
