import { type CSSProperties } from 'react';
import { color, font, radius, space } from '../theme/tokens';
import { Girih } from './Girih';
import { Niche } from './Niche';

export type PrayerCardState = 'idle' | 'next';

interface PrayerCardProps {
  name: string; // "Maghrib"
  arabic: string; // "المغرب"
  adhan: string; // "8:24 PM"
  iqamah: string; // "8:34 PM"
  state?: PrayerCardState;
}

const NICHE_W = 404;
const NICHE_H = 470;
const NICHE_SHOULDER = 184;

const IDLE_W = 344;
const IDLE_H = 360;

function TimeColumn({ label, value, accent }: { label: string; value: string; accent: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          font: `700 20px ${font.body}`,
          letterSpacing: '0.18em',
          color: color.plasterDim,
        }}
      >
        {label}
      </span>
      <span
        style={{
          font: `500 38px ${font.body}`,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          color: accent ? color.brass : color.plaster,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CardContent({ name, arabic, adhan, iqamah, state }: Required<PrayerCardProps>) {
  const isNext = state === 'next';
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.md,
        padding: isNext ? `${space.xxxl}px ${space.lg}px ${space.xl}px` : `${space.lg}px`,
        textAlign: 'center',
      }}
    >
      {isNext && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <Girih size={18} color={color.brass} />
          <span style={{ font: `700 20px ${font.body}`, letterSpacing: '0.32em', color: color.brass }}>
            NEXT
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ font: `600 56px ${font.display}`, color: color.plaster, lineHeight: 1 }}>{name}</span>
        <span
          dir="rtl"
          lang="ar"
          style={{ font: `700 42px ${font.arabic}`, color: isNext ? color.brassGlow : color.plasterDim, lineHeight: 1.2 }}
        >
          {arabic}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 44, marginTop: space.sm }}>
        <TimeColumn label="ADHAN" value={adhan} accent={false} />
        <TimeColumn label="IQAMAH" value={iqamah} accent={isNext} />
      </div>
    </div>
  );
}

/**
 * One prayer, in two states:
 *   idle — a quiet flat panel on the night field.
 *   next — the "Mihrab Light" signature: a pointed-arch niche lit from within.
 */
export function PrayerCard({ name, arabic, adhan, iqamah, state = 'idle' }: PrayerCardProps) {
  const content = <CardContent name={name} arabic={arabic} adhan={adhan} iqamah={iqamah} state={state} />;

  if (state !== 'next') {
    const idleStyle: CSSProperties = {
      position: 'relative',
      width: IDLE_W,
      height: IDLE_H,
      borderRadius: radius.lg,
      background: `color-mix(in srgb, ${color.zellige} 20%, ${color.nightLapis})`,
      border: `1px solid color-mix(in srgb, ${color.plaster} 13%, transparent)`,
    };
    return <div style={idleStyle}>{content}</div>;
  }

  return (
    <Niche width={NICHE_W} height={NICHE_H} shoulder={NICHE_SHOULDER}>
      {/* faint girih watermark behind the content */}
      <div style={{ position: 'absolute', top: 150, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <Girih size={200} color={color.brass} opacity={0.05} outline />
      </div>
      {content}
    </Niche>
  );
}
