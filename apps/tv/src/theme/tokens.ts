/**
 * Design tokens — generated from DESIGN.md (the "lamplit night" system).
 * Every color and type decision in the TV app derives from here.
 */

export const color = {
  nightLapis: '#0E2038', // base background — deep lapis night
  inkWell: '#081320', // deepest layer — vignette / night-dim target
  plaster: '#F2E9D5', // primary foreground — warm plaster light
  plasterDim: '#ADA690', // muted foreground — labels, the quiet 80%
  brass: '#C8A24C', // primary accent — the lit niche, the active prayer
  brassGlow: '#EBCB8B', // light brass — inner glow / highlights
  zellige: '#2E8E80', // secondary accent — tile jade, geometry
  mauveDusk: '#6F5A80', // atmosphere only — the time-of-day sky band
} as const;

/** Time-of-day phases — drive the Phase 3 ambient background. */
export const phase = {
  dawn: { base: '#13233E', glow: color.mauveDusk },
  day: { base: '#173247', glow: color.brass },
  dusk: { base: '#0F2038', glow: color.brass },
  night: { base: '#0A1828', glow: color.inkWell },
} as const;

export const font = {
  display: "'Fraunces Variable', Georgia, 'Times New Roman', serif",
  body: "'Hanken Grotesk Variable', system-ui, sans-serif",
  arabic: "'Amiri', 'Hanken Grotesk Variable', serif",
} as const;

/** Type scale in px at 1920×1080 (10-ft legibility; the countdown is loudest). */
export const type = {
  countdown: 200,
  heroName: 104,
  heroArabic: 72,
  prayerName: 46,
  prayerArabic: 34,
  time: 40,
  label: 22,
  date: 30,
  announce: 36,
  meta: 22,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
  xxxl: 96,
  huge: 128,
} as const;

export const radius = { sm: 10, md: 20, lg: 32, pill: 999 } as const;

export const motion = {
  ambientMs: 60_000, // one slow ambient loop
  breatheMs: 8_000, // the niche glow breathing
  ease: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

export const tokens = { color, phase, font, type, space, radius, motion } as const;
export default tokens;
