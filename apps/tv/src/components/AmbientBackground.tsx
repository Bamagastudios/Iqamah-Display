import { type CSSProperties } from 'react';
import { color } from '../theme/tokens';
import { Girih } from './Girih';

interface AmbientBackgroundProps {
  /** Where the glows sit this hour (ambient motion on); omit to keep them in place. */
  shift?: { dx: number; dy: number };
}

/**
 * Brightness of a glow from its centre (0) out to its edge (last), in tenths of its reach:
 * the old cone gradient seen through a 64px blur, measured and baked into plain stops — the
 * same soft light without a `filter`, which a TV has to recompute whenever it repaints.
 */
const FALLOFF = [0.8, 0.76, 0.66, 0.53, 0.39, 0.25, 0.13, 0.04, 0.01, 0, 0];

/** A soft round glow of `tint` centred at (cx, cy) on the board; `size` matches the old blob. */
function glow(tint: string, strength: number, cx: number, cy: number, size: number, dx = 0, dy = 0): CSSProperties {
  const reach = Math.round((0.66 * size) / Math.SQRT2 + 3 * 64); // where the blurred blob faded out
  const stops = FALLOFF.map((f, i) => `color-mix(in srgb, ${tint} ${+(strength * f).toFixed(1)}%, transparent) ${i * 10}%`);
  return {
    position: 'absolute',
    left: cx - reach + dx,
    top: cy - reach + dy,
    width: 2 * reach,
    height: 2 * reach,
    background: `radial-gradient(circle closest-side, ${stops.join(', ')})`,
    opacity: 0.5,
    pointerEvents: 'none',
  };
}

/**
 * The signature ambient layer: a couple of faint "mihrab light" glows and a barely-visible
 * girih. It holds perfectly still — a constantly drifting background made the TV redraw the
 * whole screen ~60 times a second. With ambient motion on, the glows step to a new spot
 * once an hour (alongside the board's anti-burn-in shift) instead.
 */
export function AmbientBackground({ shift }: AmbientBackgroundProps) {
  const { dx = 0, dy = 0 } = shift ?? {};
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* base dusk wash rising from the horizon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(135% 95% at 50% 122%, color-mix(in srgb, ${color.mauveDusk} 24%, transparent) 0%, transparent 52%)`,
        }}
      />
      <div style={glow(color.brass, 30, 230, 525, 920, dx, dy)} />
      <div style={glow(color.mauveDusk, 32, 1702, 821, 820, -dx, -dy)} />
      {/* a barely-there girih */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.04,
        }}
      >
        <Girih size={1180} color={color.brass} outline />
      </div>
    </div>
  );
}
