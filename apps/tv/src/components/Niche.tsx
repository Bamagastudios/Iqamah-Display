import { useId, type ReactNode } from 'react';
import { color } from '../theme/tokens';

/** A pointed (mihrab) arch silhouette: vertical sides to the shoulders, then a cusped point. */
export function nichePath(w: number, h: number, shoulder: number): string {
  const cx = w / 2;
  const apexY = 10;
  return [
    `M0 ${h}`,
    `L0 ${shoulder}`,
    `C ${w * 0.08} ${shoulder * 0.42} ${w * 0.34} ${apexY + 24} ${cx} ${apexY}`,
    `C ${w * 0.66} ${apexY + 24} ${w * 0.92} ${shoulder * 0.42} ${w} ${shoulder}`,
    `L ${w} ${h}`,
    'Z',
  ].join(' ');
}

interface NicheProps {
  width: number;
  height: number;
  shoulder?: number;
  glow?: boolean;
  children?: ReactNode;
}

/** The "Mihrab Light" signature frame: a pointed-arch niche lit from within. */
export function Niche({ width, height, shoulder, glow = true, children }: NicheProps) {
  const id = useId();
  const sh = shoulder ?? Math.round(height * 0.39);
  return (
    <div style={{ position: 'relative', width, height, filter: `drop-shadow(0 0 64px color-mix(in srgb, ${color.brass} 18%, transparent))` }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: color.zellige }} />
            <stop offset="1" style={{ stopColor: color.nightLapis }} />
          </linearGradient>
        </defs>
        <path d={nichePath(width, height, sh)} fill={`url(#${id})`} style={{ stroke: color.brass, strokeWidth: 1.75 }} />
      </svg>
      {glow && (
        <div
          style={{
            position: 'absolute',
            top: Math.round(height * 0.08),
            left: '50%',
            width: width * 0.85,
            height: height * 0.76,
            transform: 'translateX(-50%)',
            background: `radial-gradient(circle at 50% 38%, color-mix(in srgb, ${color.brassGlow} 32%, transparent) 0%, color-mix(in srgb, ${color.brassGlow} 10%, transparent) 36%, transparent 66%)`,
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>{children}</div>
    </div>
  );
}
