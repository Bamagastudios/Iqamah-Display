/**
 * DatoCMS iqāmah source. The masjid maintains iqāmah times in DatoCMS (the same source
 * tajweedusa.org shows); this pulls them so the TV matches the website. We take only the
 * iqāmah times — adhān, sunrise and the Hijri date still come from the prayer-times feed,
 * and Maghrib stays adhān + offset (its adhān shifts daily).
 *
 * The token is a read-only Content Delivery token (safe in the browser by design — it can
 * only read already-public CMS content). Override/rotate with VITE_DATO_TOKEN.
 */

const DATO_URL = 'https://graphql.datocms.com';
const DATO_TOKEN = import.meta.env.VITE_DATO_TOKEN ?? '1dfc02974298aa7163ba9a5f30c418';
const QUERY = '{ general { jumAhTime fajrTime dhuhrTime asrTime maghribTime ishaTime } }';

export interface DatoGeneral {
  fajrTime?: string | null;
  dhuhrTime?: string | null;
  asrTime?: string | null;
  maghribTime?: string | null;
  ishaTime?: string | null;
  jumAhTime?: string | null;
}

/** Iqāmah override pulled from DatoCMS. Maghrib is intentionally absent (adhān + offset). */
export interface DatoIqamah {
  /** "HH:mm" (24h) keyed by prayer name: Fajr, Dhuhr, Asr, Isha. */
  iqamah: Record<string, string>;
  /** Jummah iqāmah "HH:mm". */
  jummah?: string;
}

/**
 * Parse a loose time string into "HH:mm" (24h), or null if unusable. Handles the shapes a
 * CMS field might hold: "6:30am", "6:30 AM", "6:30 a.m.", "06:30", "18:00", "6:30:00 pm".
 */
export function parseFlexibleTime(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const s = String(raw).trim().toLowerCase();
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?m\.?|p\.?m\.?)?$/.exec(s);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  if (min > 59) return null;
  const mer = m[3] ? m[3].replace(/\./g, '') : '';
  if (mer === 'am') {
    if (h === 12) h = 0;
  } else if (mer === 'pm') {
    if (h !== 12) h += 12;
  }
  if (h > 23) return null;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(h)}:${p(min)}`;
}

/** Map a DatoCMS `general` record to our iqāmah override (Maghrib omitted on purpose). */
export function datoToIqamah(g: DatoGeneral | null | undefined): DatoIqamah | null {
  if (!g) return null;
  const iqamah: Record<string, string> = {};
  const put = (name: string, raw: string | null | undefined) => {
    const t = parseFlexibleTime(raw);
    if (t) iqamah[name] = t;
  };
  put('Fajr', g.fajrTime);
  put('Dhuhr', g.dhuhrTime);
  put('Asr', g.asrTime);
  put('Isha', g.ishaTime);
  const jummah = parseFlexibleTime(g.jumAhTime) ?? undefined;
  if (Object.keys(iqamah).length === 0 && !jummah) return null; // nothing usable
  return { iqamah, jummah };
}

/** Whether a DatoCMS token is configured at all (feature is off when blank). */
export function datoEnabled(): boolean {
  return !!DATO_TOKEN;
}

/**
 * Fetch the iqāmah times from DatoCMS. Throws on network error / non-2xx / bad shape so the
 * caller keeps last-known-good. Returns null when the record holds no usable times.
 */
export async function fetchDatoIqamah(signal?: AbortSignal): Promise<DatoIqamah | null> {
  if (!DATO_TOKEN) return null;
  const res = await fetch(DATO_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DATO_TOKEN}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({ query: QUERY }),
  });
  if (!res.ok) throw new Error(`DatoCMS responded ${res.status}`);
  const json: unknown = await res.json();
  const general = (json as { data?: { general?: DatoGeneral } })?.data?.general;
  return datoToIqamah(general);
}
