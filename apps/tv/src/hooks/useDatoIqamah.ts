import { useEffect, useMemo, useRef, useState } from 'react';
import { datoEnabled, fetchDatoIqamah, type DatoIqamah } from '../api/datoCms';
import type { ManualTimes } from '../domain/manualTimes';

const POLL_MS = 5 * 60_000; // iqāmah edits in DatoCMS reach the board within ~5 min
const CACHE_KEY = 'masjidtv:dato-iqamah:v1';

function readCache(): DatoIqamah | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as DatoIqamah) : undefined;
  } catch {
    return undefined;
  }
}

function writeCache(value: DatoIqamah): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // storage full or blocked — the in-memory copy still works
  }
}

/**
 * Iqāmah times from DatoCMS, shaped as an 'always' override (the same overlay the manual
 * backup uses). Hydrates from the last good copy, polls, and keeps that copy on any failure,
 * so a DatoCMS blip never blanks or reverts the board. Undefined until a usable set arrives
 * — the feed's own times show meanwhile.
 */
export function useDatoIqamah(pollMs = POLL_MS): ManualTimes | undefined {
  const [times, setTimes] = useState<DatoIqamah | undefined>(() => (datoEnabled() ? readCache() : undefined));
  const mounted = useRef(true);

  useEffect(() => {
    if (!datoEnabled()) return;
    mounted.current = true;
    const ac = new AbortController();

    async function load() {
      try {
        const next = await fetchDatoIqamah(ac.signal);
        if (!mounted.current || !next) return;
        // keep the same object when nothing changed, so memoized consumers (the schedule,
        // the slide rotation) don't churn on every poll
        setTimes((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
        writeCache(next);
      } catch {
        // offline / DatoCMS unreachable — keep the last good copy
      }
    }

    void load();
    const id = setInterval(load, pollMs);
    return () => {
      mounted.current = false;
      ac.abort();
      clearInterval(id);
    };
  }, [pollMs]);

  return useMemo<ManualTimes | undefined>(
    () => (times ? { mode: 'always', iqamah: times.iqamah, jummah: times.jummah } : undefined),
    [times],
  );
}
