import { color as palette } from '../theme/tokens';

interface GirihProps {
  size?: number;
  color?: string;
  opacity?: number;
  /** Outline only (used as the faint watermark); otherwise a filled star. */
  outline?: boolean;
}

/** Path for an 8-point star (khatim) — points at outer radius R, valleys at r. */
function eightPointStar(c: number, R: number, r: number): string {
  const points = 8;
  const step = Math.PI / points;
  const rot = -Math.PI / 2;
  let d = '';
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? R : r;
    const a = rot + i * step;
    d += `${i === 0 ? 'M' : 'L'}${(c + rad * Math.cos(a)).toFixed(2)},${(c + rad * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
}

/**
 * The secondary motif: a geometrically-constructed 8-point girih star.
 * Used only as the active-prayer tick and a faint watermark — never decoration.
 */
export function Girih({ size = 24, color = palette.brass, opacity = 1, outline = false }: GirihProps) {
  const R = size / 2;
  const d = eightPointStar(R, R - 0.75, R * 0.541);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity, display: 'block' }} aria-hidden="true">
      <path
        d={d}
        style={{ fill: outline ? 'none' : color, stroke: color, strokeWidth: outline ? 1.25 : 0 }}
        strokeLinejoin="round"
      />
    </svg>
  );
}
