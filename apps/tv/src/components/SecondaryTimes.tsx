import { type CSSProperties } from 'react';
import { color, font, radius } from '../theme/tokens';

interface SecondaryTimesProps {
  sunriseTime?: string;
  jummahTime?: string;
}

const cell: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 14,
  padding: '14px 22px',
  borderRadius: radius.md,
};

const label = (c: string): CSSProperties => ({ font: `600 27px ${font.display}`, color: c });
const arabic: CSSProperties = { font: `700 21px ${font.arabic}`, color: color.plasterDim };
const time = (c: string): CSSProperties => ({ font: `600 27px ${font.body}`, fontVariantNumeric: 'tabular-nums', color: c });

/**
 * Sunrise (Shurooq) and the fixed Friday Jummah — grouped at the foot of the
 * board, set apart from the five daily prayers above.
 */
export function SecondaryTimes({ sunriseTime, jummahTime }: SecondaryTimesProps) {
  return (
    <div style={{ width: '100%', maxWidth: 680 }}>
      <div style={{ height: 1, background: `color-mix(in srgb, ${color.plaster} 14%, transparent)`, margin: '0 22px 12px' }} />
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ ...cell, background: `color-mix(in srgb, ${color.plaster} 4%, transparent)` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={label(color.plasterDim)}>Shurooq</span>
            <span dir="rtl" lang="ar" style={arabic}>
              الشروق
            </span>
          </div>
          <span style={time(color.plasterDim)}>{sunriseTime ?? '—'}</span>
        </div>

        <div
          style={{
            ...cell,
            background: `color-mix(in srgb, ${color.zellige} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color.zellige} 50%, transparent)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={label(color.plaster)}>Jummah</span>
            <span dir="rtl" lang="ar" style={arabic}>
              الجمعة
            </span>
          </div>
          <span style={time(color.zellige)}>{jummahTime ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}
