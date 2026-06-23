import { color, font } from '../theme/tokens';
import { Niche } from './Niche';
import { Girih } from './Girih';

interface NextHeroProps {
  name: string;
  arabic: string;
  iqamah12: string;
  countdown: string; // "HH:MM:SS"
}

/** The hero: the lit-niche signature naming the next prayer, beside the big live countdown. */
export function NextHero({ name, arabic, iqamah12, countdown }: NextHeroProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
      <Niche width={236} height={284}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingTop: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Girih size={14} color={color.brass} />
            <span style={{ font: `700 16px ${font.body}`, letterSpacing: '0.3em', color: color.brass }}>NEXT</span>
          </div>
          <span style={{ font: `600 50px ${font.display}`, color: color.plaster, lineHeight: 1 }}>{name}</span>
          <span dir="rtl" lang="ar" style={{ font: `700 36px ${font.arabic}`, color: color.brassGlow, lineHeight: 1.3 }}>
            {arabic}
          </span>
        </div>
      </Niche>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ font: `700 20px ${font.body}`, letterSpacing: '0.24em', color: color.plasterDim }}>UNTIL IQAMAH</span>
        <span
          style={{
            font: `500 124px ${font.body}`,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
            color: color.brass,
            lineHeight: 0.95,
          }}
        >
          {countdown}
        </span>
        <span style={{ font: `400 27px ${font.body}`, color: color.plasterDim }}>
          {name} iqamah at {iqamah12}
        </span>
      </div>
    </div>
  );
}
