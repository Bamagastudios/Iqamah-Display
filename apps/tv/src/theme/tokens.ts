/**
 * Design tokens — generated from DESIGN.md (the "lamplit night" system).
 * Every color and type decision in the TV app derives from here.
 */

/**
 * Colors resolve to CSS variables (defined in global.css, overridable from backend
 * config via theme/theme.ts), each with the design default as a fallback.
 */
export const color = {
  nightLapis: 'var(--c-bg, #222831)', // base background — charcoal
  inkWell: 'var(--c-deep, #171B22)', // deepest layer — vignette / night-dim target
  plaster: 'var(--c-fg, #F6F0E4)', // primary foreground — cream
  plasterDim: 'var(--c-fg-dim, #B5AD9B)', // muted foreground — soft sand
  brass: 'var(--c-accent, #1DA0A8)', // primary accent — turquoise (brand)
  brassGlow: 'var(--c-accent-glow, #57C6CB)', // light turquoise — glow / highlights
  zellige: 'var(--c-accent2, #0C4F54)', // secondary accent — deep teal
  mauveDusk: 'var(--c-atmos, #E3D7C0)', // atmosphere — warm sand
  // Per-region colors — independently editable from the admin (default to the above).
  niche: 'var(--c-niche, #1DA0A8)', // mihrab niche signature
  announce: 'var(--c-announce, #0C4F54)', // announcements heading
  donate: 'var(--c-donate, #0C4F54)', // "support the masjid" heading
  jummah: 'var(--c-jummah, #0C4F54)', // Jummah row
} as const;

/** Raw default hex values (for places that need a concrete color, e.g. gradients). */
export const colorHex = {
  nightLapis: '#222831',
  inkWell: '#171B22',
  plaster: '#F6F0E4',
  plasterDim: '#B5AD9B',
  brass: '#1DA0A8',
  brassGlow: '#57C6CB',
  zellige: '#0C4F54',
  mauveDusk: '#E3D7C0',
} as const;

/** Time-of-day phases — drive the Phase 3 ambient background. */
export const phase = {
  dawn: { base: '#243038', glow: color.mauveDusk },
  day: { base: '#26333B', glow: color.brass },
  dusk: { base: '#1E2A30', glow: color.brass },
  night: { base: '#15191F', glow: color.zellige },
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
