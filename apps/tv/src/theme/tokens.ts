/**
 * Design tokens — generated from DESIGN.md (the "lamplit night" system).
 * Every color and type decision in the TV app derives from here.
 */

/**
 * Colors resolve to CSS variables (defined in global.css, overridable from backend
 * config via theme/theme.ts), each with the design default as a fallback.
 */
export const color = {
  nightLapis: 'var(--c-bg, #0E2038)', // base background — deep lapis night
  inkWell: 'var(--c-deep, #081320)', // deepest layer — vignette / night-dim target
  plaster: 'var(--c-fg, #F2E9D5)', // primary foreground — warm plaster light
  plasterDim: 'var(--c-fg-dim, #ADA690)', // muted foreground — labels, the quiet 80%
  brass: 'var(--c-accent, #C8A24C)', // primary accent — the lit niche, the active prayer
  brassGlow: 'var(--c-accent-glow, #EBCB8B)', // light brass — inner glow / highlights
  zellige: 'var(--c-accent2, #2E8E80)', // secondary accent — tile jade, geometry
  mauveDusk: 'var(--c-atmos, #6F5A80)', // atmosphere — the time-of-day sky band
} as const;

/** Raw default hex values (for places that need a concrete color, e.g. gradients). */
export const colorHex = {
  nightLapis: '#0E2038',
  inkWell: '#081320',
  plaster: '#F2E9D5',
  plasterDim: '#ADA690',
  brass: '#C8A24C',
  brassGlow: '#EBCB8B',
  zellige: '#2E8E80',
  mauveDusk: '#6F5A80',
} as const;

/** Time-of-day phases — drive the Phase 3 ambient background. */
export const phase = {
  dawn: { base: '#13233E', glow: color.mauveDusk },
  day: { base: '#173247', glow: color.brass },
  dusk: { base: '#0F2038', glow: color.brass },
  night: { base: '#0A1828', glow: color.inkWell },
} as const;

export const font = {
  display: 'var(--f-display)',
  body: 'var(--f-body)',
  arabic: 'var(--f-arabic)',
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
