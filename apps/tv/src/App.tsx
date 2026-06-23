import type { CSSProperties } from 'react';
import { useClock } from './hooks/useClock';
import { usePrayerData } from './hooks/usePrayerData';
import { buildPrayerInstants, countdown, currentState, nextIqamah } from './domain/schedule';
import { format12h, padCountdown, stateLabel } from './domain/format';

/**
 * Phase 0 view — INTENTIONALLY UNSTYLED.
 *
 * This is throwaway scaffolding to prove the data + schedule logic: real prayer times
 * render as plain text and the countdown to the next iqamah ticks correctly across
 * boundaries. No palette, type, or layout decisions are made here — the design system
 * (DESIGN.md) is Phase 1, and the real UI is built from those tokens afterwards.
 */
export default function App() {
  const now = useClock(1000);
  const { data, source, stale, lastUpdated, error } = usePrayerData();

  const instants = buildPrayerInstants(data);
  const next = nextIqamah(instants, now);
  const state = currentState(instants, now);
  const cd = next ? countdown(next.at, now) : null;

  const isFriday = data.isFriday;

  return (
    <main style={page}>
      <p style={muted}>
        {data.weekday} · {data.date} · {data.hijriLabel}
      </p>

      <section style={{ margin: '1.5rem 0' }}>
        <div style={muted}>{stateLabel(state)}</div>
        <h1 style={{ margin: '0.25rem 0', fontWeight: 600 }}>
          {next ? (
            <>
              Next: {next.displayName} — iqamah {format12h(next.at)}
            </>
          ) : (
            'No upcoming iqamah'
          )}
        </h1>
        <div style={clock}>{cd ? padCountdown(cd) : '—:—:—'}</div>
      </section>

      <ul style={list}>
        {data.prayers.map((p) => {
          const isNext = next?.prayer === p.name;
          const isFridayDhuhr = isFriday && p.name.toLowerCase() === 'dhuhr';
          const label = isFridayDhuhr ? 'Jummah' : p.displayName;
          const adhan12 = p.adhan12;
          const iqamah12 = isFridayDhuhr ? data.jummah.iqamah12 : p.iqamah12;
          return (
            <li key={p.name} style={{ fontWeight: isNext ? 700 : 400 }}>
              <span style={{ display: 'inline-block', width: '1.2em' }}>{isNext ? '▸' : ''}</span>
              {label} — adhan {adhan12} · iqamah {iqamah12}
            </li>
          );
        })}
      </ul>

      <footer style={footer}>
        <span>sunrise {data.sunrise12}</span>
        {' · '}
        <span>
          {source === 'live' && !stale
            ? 'live'
            : `offline — showing ${source === 'sample' ? 'sample data' : 'last update'}`}
          {lastUpdated ? ` (updated ${new Date(lastUpdated).toLocaleTimeString()})` : ''}
        </span>
        {error ? <span> · {error}</span> : null}
      </footer>
    </main>
  );
}

// Bare structural styles only (system font, spacing, tabular numerals for the clock).
// Deliberately NOT a design — that begins in Phase 1.
const page: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  padding: '2rem',
  lineHeight: 1.5,
};

const muted: CSSProperties = { opacity: 0.7, fontSize: '0.95rem' };

const clock: CSSProperties = {
  fontSize: '3.5rem',
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum"',
};

const list: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '1rem 0',
  fontSize: '1.25rem',
  lineHeight: 2,
};

const footer: CSSProperties = { marginTop: '2rem', ...muted };
