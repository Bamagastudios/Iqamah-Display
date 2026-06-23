import { color, font } from '../theme/tokens';
import { Girih } from './Girih';

interface DateBarProps {
  masjidName: string;
  gregorian: string;
  hijri: string;
}

/** Top bar: masjid logo/name (left) + Gregorian & Hijri date (right). */
export function DateBar({ masjidName, gregorian, hijri }: DateBarProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
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
        <span style={{ font: `600 34px ${font.display}`, color: color.plaster }}>{masjidName}</span>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: `500 30px ${font.body}`, color: color.plaster }}>{gregorian}</span>
        <span style={{ font: `400 26px ${font.body}`, color: color.brass }}>{hijri}</span>
      </div>
    </header>
  );
}
