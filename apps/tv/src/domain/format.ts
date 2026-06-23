import type { Countdown, PrayerState } from './schedule';

/** Format a Date as a 12-hour wall-clock string, e.g. "1:45 PM". */
export function format12h(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Zero-padded "HH:MM:SS" for the countdown. */
export function padCountdown(cd: Countdown): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(cd.h)}:${p(cd.m)}:${p(cd.s)}`;
}

/** Human label for the current prayer state (plain Phase-0 copy). */
export function stateLabel(s: PrayerState): string {
  switch (s.kind) {
    case 'idle':
      return 'Counting down to the next iqamah';
    case 'adhan':
      return `Adhan — ${s.prayer}`;
    case 'iqamah':
      return `Iqamah — ${s.prayer}`;
    case 'inprogress':
      return `${s.prayer} in progress`;
  }
}
