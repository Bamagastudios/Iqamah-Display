import { useEffect, useState } from 'react';
import { applyTheme } from '../theme/theme';
import { fetchDisplayConfig, themeFromRow } from '../api/config';
import type { SidePanelMode } from '../components/SidePanel';
import type { ManualTimes } from '../domain/manualTimes';

const POLL_MS = 15_000; // branding changes apply within ~15s

export interface ResolvedConfig {
  masjidName?: string;
  logoUrl?: string;
  sidePanel?: SidePanelMode | 'off';
  donateUrl?: string;
  ambientMotion?: boolean;
  alertEnabled?: boolean;
  alertText?: string;
  nightDim?: boolean;
  prayerMoments?: boolean;
  manualTimes?: ManualTimes;
}

/**
 * Reads branding/config from Supabase, applies the theme (colors + fonts) to the
 * document, and returns the display props. On any failure it keeps the built-in
 * defaults — the TV never breaks if the config layer is unreachable. Polls, but only
 * re-themes and re-renders when the row actually changed (an admin save), so a steady
 * config never touches the screen.
 */
export function useConfig(pollMs = POLL_MS): ResolvedConfig {
  const [cfg, setCfg] = useState<ResolvedConfig>({});

  useEffect(() => {
    let mounted = true;
    let applied = ''; // serialized row last applied

    async function load() {
      try {
        const row = await fetchDisplayConfig();
        if (!row || !mounted) return;
        const key = JSON.stringify(row);
        if (key === applied) return; // unchanged — leave the screen alone
        applied = key;
        applyTheme(document.documentElement, themeFromRow(row));
        setCfg({
          masjidName: row.masjid_name ?? undefined,
          logoUrl: row.logo_url ?? undefined,
          sidePanel: row.side_panel ?? undefined,
          donateUrl: row.donate_url ?? undefined,
          ambientMotion: row.ambient_motion ?? undefined,
          alertEnabled: row.alert_enabled ?? undefined,
          alertText: row.alert_text ?? undefined,
          nightDim: row.night_dim ?? undefined,
          prayerMoments: row.prayer_moments ?? undefined,
          manualTimes: row.manual_times ?? undefined,
        });
      } catch {
        // offline / not configured — keep the built-in defaults
      }
    }

    void load();
    const id = setInterval(load, pollMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [pollMs]);

  return cfg;
}
