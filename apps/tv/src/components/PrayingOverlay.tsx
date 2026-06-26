import { type CSSProperties } from 'react';
import { color, font } from '../theme/tokens';
import type { PrayerState } from '../domain/schedule';
import { Girih } from './Girih';

interface Copy {
  label: string;
  en: string;
  ar: string;
}

function copyFor(state: PrayerState): Copy | null {
  switch (state.kind) {
    case 'adhan':
      return { label: 'ADHĀN', en: 'It’s time to pray', ar: 'حَيَّ عَلَى الصَّلَاة' };
    case 'iqamah':
      return { label: 'IQĀMAH', en: 'Straighten and close the rows', ar: 'أَقِيمُوا الصُّفُوف' };
    case 'inprogress':
      return { label: 'IN PRAYER', en: 'Prayer in progress', ar: 'الصَّلَاةُ قَائِمَة' };
    default:
      return null;
  }
}

/**
 * The "now praying" moment: when the board hits an adhān, iqāmah, or in-progress
 * window (from the pure schedule core), it takes over the screen with a calm,
 * unmistakable call to prayer instead of the usual countdown.
 */
export function PrayingOverlay({ state, arabic }: { state: PrayerState; arabic?: string }) {
  const copy = copyFor(state);
  if (!copy || state.kind === 'idle') return null;

  const prayer = state.prayer;
  // In-progress is the calmest (people are already praying); iqāmah the most focused.
  const veil = state.kind === 'inprogress' ? 0.96 : state.kind === 'iqamah' ? 0.93 : 0.86;

  const backdrop: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${color.niche} 22%, transparent) 0%, transparent 58%), ${color.nightLapis}`,
    opacity: veil,
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'moment-in 700ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={backdrop} />
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          borderRadius: '50%',
          background: `radial-gradient(circle, color-mix(in srgb, ${color.niche} 18%, transparent) 0%, transparent 62%)`,
          animation: 'moment-pulse 4s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Girih size={20} color={color.niche} />
          <span style={{ font: `700 26px ${font.body}`, letterSpacing: '0.42em', color: color.niche }}>{copy.label}</span>
          <Girih size={20} color={color.niche} />
        </div>

        <span style={{ font: `600 132px ${font.display}`, color: color.plaster, lineHeight: 1 }}>{prayer}</span>
        {arabic && (
          <span dir="rtl" lang="ar" style={{ font: `700 84px ${font.arabic}`, color: color.niche, lineHeight: 1.25 }}>
            {arabic}
          </span>
        )}

        <span dir="rtl" lang="ar" style={{ font: `700 46px ${font.arabic}`, color: color.plaster, marginTop: 26, lineHeight: 1.3 }}>
          {copy.ar}
        </span>
        <span style={{ font: `400 34px ${font.body}`, color: color.plasterDim, letterSpacing: '0.04em' }}>{copy.en}</span>
      </div>
    </div>
  );
}
