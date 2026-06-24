import { supabase } from './supabaseClient';
import type { SidePanelMode } from '../components/SidePanel';
import type { ThemeColors, ThemeConfig } from '../theme/theme';
import { DEFAULT_THEME, FONT_STACKS } from '../theme/theme';

/** The display_config row the admin edits and the TV reads (branding only). */
export interface DisplayConfigRow {
  id: number;
  palette: Partial<ThemeColors> | null;
  fonts: { display?: string; body?: string; arabic?: string } | null;
  logo_url: string | null;
  masjid_name: string | null;
  side_panel: SidePanelMode | 'off' | null;
  donate_url: string | null;
  ambient_motion: boolean | null;
  alert_enabled: boolean | null;
  alert_text: string | null;
}

export async function fetchDisplayConfig(): Promise<DisplayConfigRow | null> {
  const { data, error } = await supabase.from('display_config').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return (data as DisplayConfigRow | null) ?? null;
}

/** Map a config row to the theme the TV applies (palette + font stacks). */
export function themeFromRow(row: DisplayConfigRow): ThemeConfig {
  const stack = (name: string | undefined, fallback: string) => (name && FONT_STACKS[name]) || fallback;
  return {
    ...DEFAULT_THEME,
    colors: { ...DEFAULT_THEME.colors, ...(row.palette ?? {}) },
    fonts: {
      display: stack(row.fonts?.display, DEFAULT_THEME.fonts.display),
      body: stack(row.fonts?.body, DEFAULT_THEME.fonts.body),
      arabic: stack(row.fonts?.arabic, DEFAULT_THEME.fonts.arabic),
    },
    masjidName: row.masjid_name ?? DEFAULT_THEME.masjidName,
    sidePanel: row.side_panel ?? DEFAULT_THEME.sidePanel,
    logoUrl: row.logo_url ?? undefined,
    ambientMotion: row.ambient_motion ?? DEFAULT_THEME.ambientMotion,
  };
}
