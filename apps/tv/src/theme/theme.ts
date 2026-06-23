/**
 * Runtime theme config — the shape the backend will edit (Phase 4) to skin the whole
 * display: colors, fonts, logo, and panel options. `applyTheme` writes these to CSS
 * variables on a target element; every component already reads those variables via
 * theme/tokens.ts, so the entire UI re-skins with no code changes.
 */

import type { SidePanelMode } from '../components/SidePanel';

export interface ThemeColors {
  bg: string;
  deep: string;
  fg: string;
  fgDim: string;
  accent: string;
  accentGlow: string;
  accent2: string;
  atmos: string;
}

export interface ThemeFonts {
  display: string;
  body: string;
  arabic: string;
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  logoUrl?: string;
  masjidName: string;
  sidePanel: SidePanelMode | 'off';
  ambientMotion: boolean;
}

/** The default skin: "Calm & modern" — teal leads, soft neutrals, charcoal ground. */
export const DEFAULT_THEME: ThemeConfig = {
  name: 'Calm & modern',
  colors: {
    bg: '#222831',
    deep: '#171B22',
    fg: '#F6F0E4',
    fgDim: '#B5AD9B',
    accent: '#1DA0A8',
    accentGlow: '#57C6CB',
    accent2: '#0C4F54',
    atmos: '#E3D7C0',
  },
  fonts: {
    display: "'Fraunces Variable', Georgia, 'Times New Roman', serif",
    body: "'Hanken Grotesk Variable', system-ui, sans-serif",
    arabic: "'Amiri', 'Hanken Grotesk Variable', serif",
  },
  masjidName: 'Tajweed Institute',
  sidePanel: 'both',
  ambientMotion: true,
};

/** A second built-in skin — proof the board fully re-themes from config. */
export const EMERALD_THEME: ThemeConfig = {
  ...DEFAULT_THEME,
  name: 'Emerald & Gold',
  colors: {
    bg: '#0B2722',
    deep: '#061613',
    fg: '#F1ECDB',
    fgDim: '#9FB0A4',
    accent: '#E0B64A',
    accentGlow: '#F5DEA0',
    accent2: '#37A98C',
    atmos: '#3C6B5C',
  },
};

const COLOR_VARS: Record<keyof ThemeColors, string> = {
  bg: '--c-bg',
  deep: '--c-deep',
  fg: '--c-fg',
  fgDim: '--c-fg-dim',
  accent: '--c-accent',
  accentGlow: '--c-accent-glow',
  accent2: '--c-accent2',
  atmos: '--c-atmos',
};

const FONT_VARS: Record<keyof ThemeFonts, string> = {
  display: '--f-display',
  body: '--f-body',
  arabic: '--f-arabic',
};

/** Write a theme's colors + fonts onto an element's CSS variables. */
export function applyTheme(el: HTMLElement, theme: ThemeConfig): void {
  (Object.keys(COLOR_VARS) as Array<keyof ThemeColors>).forEach((k) => {
    el.style.setProperty(COLOR_VARS[k], theme.colors[k]);
  });
  (Object.keys(FONT_VARS) as Array<keyof ThemeFonts>).forEach((k) => {
    el.style.setProperty(FONT_VARS[k], theme.fonts[k]);
  });
}
