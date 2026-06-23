import { useId, type CSSProperties } from 'react';
import { color, font, radius, space } from '../theme/tokens';
import { Girih } from './Girih';
import { nichePath } from './Niche';

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
  const gradId = useId();
  const content = <CardContent name={name} arabic={arabic} adhan={adhan} iqamah={iqamah} state={state} />;

  if (state !== 'next') {
    const idleStyle: CSSProperties = {
      position: 'relative',
      width: IDLE_W,
      height: IDLE_H,
      borderRadius: radius.lg,
      background: '#12273F',
      border: `1px solid rgba(242, 233, 213, 0.13)`,
    };
    return <div style={idleStyle}>{content}</div>;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: NICHE_W,
        height: NICHE_H,
        filter: 'drop-shadow(0 0 64px rgba(200, 162, 76, 0.16))',
      }}
    >
      <svg
        width={NICHE_W}
        height={NICHE_H}
        viewBox={`0 0 ${NICHE_W} ${NICHE_H}`}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16314F" />
            <stop offset="1" stopColor={color.nightLapis} />
          </linearGradient>
        </defs>
        <path d={nichePath(NICHE_W, NICHE_H, NICHE_SHOULDER)} fill={`url(#${gradId})`} stroke={color.brass} strokeWidth={1.75} />
      </svg>

      {/* inner brass glow near the apex — "lit from within" */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          width: 340,
          height: 360,
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle at 50% 38%, rgba(235, 203, 139, 0.32) 0%, rgba(235, 203, 139, 0.10) 34%, rgba(235, 203, 139, 0) 66%)',
          pointerEvents: 'none',
        }}
      />

      {/* faint girih watermark behind the content */}
      <div style={{ position: 'absolute', top: 150, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <Girih size={200} color={color.brass} opacity={0.05} outline />
      </div>

      {content}
    </div>
  );
}
