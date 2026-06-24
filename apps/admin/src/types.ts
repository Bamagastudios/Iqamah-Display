export interface Palette {
  bg: string;
  deep: string;
  fg: string;
  fgDim: string;
  accent: string;
  accentGlow: string;
  accent2: string;
  atmos: string;
}

export interface Fonts {
  display: string;
  body: string;
  arabic: string;
}

export type SidePanel = 'announcements' | 'qr' | 'both' | 'off';

/** The single display_config row the admin edits and the TV reads. */
export interface DisplayConfig {
  id: number;
  palette: Palette;
  fonts: Fonts;
  logo_url: string | null;
  masjid_name: string;
  side_panel: SidePanel;
  donate_url: string | null;
  ambient_motion: boolean;
  alert_enabled: boolean;
  alert_text: string | null;
  updated_at?: string;
}

/** Bundled fonts the TV can self-host — the only options the admin can pick. */
export const FONT_OPTIONS = {
  display: ['Fraunces', 'Hanken Grotesk', 'Amiri'],
  body: ['Hanken Grotesk', 'Fraunces'],
  arabic: ['Amiri'],
} as const;

export const PALETTE_FIELDS: Array<{ key: keyof Palette; label: string }> = [
  { key: 'bg', label: 'Background' },
  { key: 'deep', label: 'Deepest' },
  { key: 'fg', label: 'Text' },
  { key: 'fgDim', label: 'Muted text' },
  { key: 'accent', label: 'Accent' },
  { key: 'accentGlow', label: 'Accent glow' },
  { key: 'accent2', label: 'Secondary' },
  { key: 'atmos', label: 'Atmosphere' },
];

export const DEFAULT_CONFIG: DisplayConfig = {
  id: 1,
  palette: {
    bg: '#222831',
    deep: '#171B22',
    fg: '#F6F0E4',
    fgDim: '#B5AD9B',
    accent: '#1DA0A8',
    accentGlow: '#57C6CB',
    accent2: '#0C4F54',
    atmos: '#E3D7C0',
  },
  fonts: { display: 'Fraunces', body: 'Hanken Grotesk', arabic: 'Amiri' },
  logo_url: null,
  masjid_name: 'Tajweed Institute',
  side_panel: 'both',
  donate_url: null,
  ambient_motion: true,
  alert_enabled: false,
  alert_text: null,
};
