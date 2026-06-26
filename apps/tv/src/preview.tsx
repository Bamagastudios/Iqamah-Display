import { createRoot } from 'react-dom/client';
import './theme/fonts';
import './theme/global.css';
import { color, font } from './theme/tokens';
import { PrayerCard } from './components/PrayerCard';
import { Girih } from './components/Girih';

const CORE: Array<[string, string]> = [
  ['nightLapis', color.nightLapis],
  ['inkWell', color.inkWell],
  ['plaster', color.plaster],
  ['brass', color.brass],
  ['zellige', color.zellige],
  ['mauveDusk', color.mauveDusk],
];

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ width: 92, height: 64, borderRadius: 12, background: hex, border: '1px solid rgba(242,233,213,0.10)' }} />
      <div style={{ font: `500 18px ${font.body}`, color: color.plaster }}>{name}</div>
      <div style={{ font: `400 16px ${font.body}`, color: color.plasterDim, letterSpacing: '0.04em' }}>{hex}</div>
    </div>
  );
}

function Specimen({ label, children, faceFont, size, c, rtl }: { label: string; children: string; faceFont: string; size: number; c: string; rtl?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ font: `700 14px ${font.body}`, letterSpacing: '0.2em', color: color.plasterDim }}>{label}</div>
      <div
        dir={rtl ? 'rtl' : undefined}
        lang={rtl ? 'ar' : undefined}
        style={{ font: `${size}px ${faceFont}`, color: c, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
      >
        {children}
      </div>
    </div>
  );
}

function Caption({ children }: { children: string }) {
  return (
    <div style={{ marginTop: 18, font: `700 15px ${font.body}`, letterSpacing: '0.22em', color: color.plasterDim, textAlign: 'center' }}>
      {children}
    </div>
  );
}

function Board() {
  return (
    <div
      style={{
        position: 'relative',
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        background: `radial-gradient(120% 80% at 50% 118%, rgba(111,90,128,0.20) 0%, rgba(111,90,128,0) 46%), radial-gradient(90% 60% at 50% 108%, rgba(200,162,76,0.16) 0%, rgba(200,162,76,0) 52%), ${color.nightLapis}`,
        color: color.plaster,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '76px 96px',
      }}
    >
      {/* header */}
      <header style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Girih size={20} color={color.brass} />
          <span style={{ font: `700 19px ${font.body}`, letterSpacing: '0.34em', color: color.brass }}>MASJID TV</span>
        </div>
        <div style={{ font: `600 60px ${font.display}`, color: color.plaster, lineHeight: 1 }}>Mihrab Light</div>
        <div style={{ font: `400 24px ${font.body}`, color: color.plasterDim }}>
          Phase 1 · the prayer card, built from the design tokens
        </div>
      </header>

      {/* cards */}
      <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 150 }}>
        <div>
          <PrayerCard name="Dhuhr" arabic="الظهر" adhan="1:18 PM" iqamah="1:45 PM" state="idle" />
          <Caption>IDLE</Caption>
        </div>
        <div>
          <PrayerCard name="Maghrib" arabic="المغرب" adhan="8:24 PM" iqamah="8:34 PM" state="next" />
          <Caption>NEXT — LIT NICHE</Caption>
        </div>
      </section>

      {/* spec footer */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 28 }}>
          {CORE.map(([n, h]) => (
            <Swatch key={n} name={n} hex={h} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 56, alignItems: 'flex-end' }}>
          <Specimen label="FRAUNCES" faceFont={font.display} size={46} c={color.plaster}>
            Maghrib
          </Specimen>
          <Specimen label="HANKEN GROTESK" faceFont={font.body} size={46} c={color.brass}>
            02:47:13
          </Specimen>
          <Specimen label="AMIRI" faceFont={font.arabic} size={46} c={color.plaster} rtl>
            المغرب
          </Specimen>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('preview')!).render(<Board />);
