import { type CSSProperties } from 'react';
import { color, font } from '../theme/tokens';
import type { MonthDay } from '../api/monthSchedule';

const HEADS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const grid: CSSProperties = { display: 'grid', gridTemplateColumns: '82px repeat(5, 1fr)', alignItems: 'center' };

interface MonthScheduleProps {
  days: MonthDay[];
  /** "YYYY-MM-DD" of today — that row is highlighted. */
  todayDate?: string;
  /** Tighter spacing for 'both' mode, where the panel is shared with the QR. */
  compact?: boolean;
}

/** One page of the month's iqamah schedule — a date column plus the five prayers. */
export function MonthSchedule({ days, todayDate, compact = false }: MonthScheduleProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ ...grid, padding: '0 6px 6px', color: color.plasterDim, font: `700 ${compact ? 13 : 15}px ${font.body}` }}>
        <span />
        {HEADS.map((h) => (
          <span key={h} style={{ textAlign: 'center' }}>
            {h}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 9, flex: 1 }}>
        {days.map((d) => {
          const today = d.date === todayDate;
          const bg = today
            ? `color-mix(in srgb, ${color.brass} 18%, transparent)`
            : d.isFriday
              ? `color-mix(in srgb, ${color.zellige} 16%, transparent)`
              : `color-mix(in srgb, ${color.plaster} 3%, transparent)`;
          const c = today ? color.brass : color.plaster;
          return (
            <div key={d.date} style={{ ...grid, padding: compact ? '5px 6px' : '7px 6px', borderRadius: 8, background: bg }}>
              <span style={{ font: `600 ${compact ? 20 : 23}px ${font.body}`, color: c }}>
                {d.day}
                <span style={{ font: `400 ${compact ? 12 : 14}px ${font.body}`, color: color.plasterDim }}> {d.dow}</span>
              </span>
              {d.iqamah.map((t, i) => (
                <span
                  key={i}
                  style={{ textAlign: 'center', font: `500 ${compact ? 17 : 20}px ${font.body}`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: c }}
                >
                  {t}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
