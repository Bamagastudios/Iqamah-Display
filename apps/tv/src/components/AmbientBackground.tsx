import { type CSSProperties } from 'react';
import { color } from '../theme/tokens';
import { Girih } from './Girih';

interface AmbientBackgroundProps {
  /** When false (reduced motion / low power), the layers hold still as a static gradient. */
  enabled?: boolean;
}

const blob = (fill: string, css: CSSProperties): CSSProperties => ({
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(64px)',
  background: `radial-gradient(circle, ${fill} 0%, transparent 66%)`,
  pointerEvents: 'none',
  ...css,
});

/**
 * The signature ambient layer: a couple of slow, faint "mihrab light" glows that drift
 * and breathe, plus a barely-visible rotating girih — enough to keep the screen alive
 * without distraction. CSS-only (transform/opacity), so it's cheap and, under
 * `prefers-reduced-motion`, freezes to a static gradient.
 */
export function AmbientBackground({ enabled = true }: AmbientBackgroundProps) {
  const motion = (value: string) => (enabled ? value : undefined);
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
      <div
        style={blob(`color-mix(in srgb, ${color.brass} 30%, transparent)`, {
          width: 920,
          height: 920,
          left: '-12%',
          top: '6%',
          opacity: 0.5,
          animation: motion('mt-drift-a 56s ease-in-out infinite, mt-breathe 19s ease-in-out infinite'),
        })}
      />
      <div
        style={blob(`color-mix(in srgb, ${color.mauveDusk} 32%, transparent)`, {
          width: 820,
          height: 820,
          right: '-10%',
          bottom: '-14%',
          opacity: 0.5,
          animation: motion('mt-drift-b 73s ease-in-out infinite, mt-breathe 26s ease-in-out infinite'),
        })}
      />
      {/* a barely-there, very slowly rotating girih */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.04,
          animation: motion('mt-spin 240s linear infinite'),
        }}
      >
        <Girih size={1180} color={color.brass} outline />
      </div>
    </div>
  );
}
