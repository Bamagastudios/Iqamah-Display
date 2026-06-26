# Masjid TV — Technical Requirements Document (TRD)

**Version:** 1.0
**Companion to:** PRD v1.0
**Audience:** the builder (you + Claude Code)

---

## 1. System overview

Two front-ends + one backend + one external API.

| Component | Tech | Hosting |
|---|---|---|
| TV app | React 18 + TypeScript + Vite, Framer Motion, packaged with Capacitor → Android APK | sideloaded to device |
| Admin panel | React 18 + TypeScript + Vite + Tailwind | Vercel |
| Content backend | Supabase (Postgres + Storage + Auth + auto REST/Realtime) | Supabase cloud (free tier) |
| Prayer-times API | existing, external | `tajweed-website-beige.vercel.app` |

Data flow: **TV app polls both** the prayer API and Supabase every 60s, merges, renders. Countdown ticks locally every second. Admin panel writes to Supabase only.

---

## 2. External API contract (do not modify — consume as-is)

`GET https://tajweed-website-beige.vercel.app/api/prayer-times`

```ts
interface PrayerTimesResponse {
  location: { latitude: number; longitude: number };
  date: string;            // "YYYY-MM-DD"
  weekday: string;         // "Monday"
  isFriday: boolean;
  sunrise: string;         // "06:23" (24h)
  sunrise12: string;       // "6:23 AM"
  hijri: { year: number; month: number; monthName: string; day: number };
  hijriLabel: string;      // "8 Muharram 1448 AH"
  prayers: Prayer[];
  jummah: { iqamah: string; iqamah12: string };
  alerts: ApiAlert[];      // may be empty
}

interface Prayer {
  name: string;            // "Fajr"
  displayName: string;     // "Fajr"
  adhan: string;           // "05:05" (24h)
  iqamah: string;          // "05:45" (24h)
  adhan12: string;         // "5:05 AM"
  iqamah12: string;        // "5:45 AM"
  isJummah: boolean;
}

type ApiAlert = unknown;   // shape unknown until populated — render defensively as string/title+body
```

**Implementation notes**
- Treat times as **local masjid time**. Build `Date` objects for *today* from `date` + the 24h `adhan`/`iqamah` strings. Don't trust the TV device's timezone blindly — anchor to the API's `date`.
- "Next prayer" algorithm: from the list of today's iqamah `Date`s, pick the first one `> now`. If none remain today (after Isha), next = **tomorrow's Fajr** → for the countdown, add 24h to today's Fajr as an approximation, then correct on the next successful fetch (the API will return tomorrow's data after midnight).
- `alerts` shape is currently empty/undefined — code must not crash on it; render each item defensively (if string → show as text; if object → look for `title`/`body`/`message`).
- Cache the last successful response in memory **and** `localStorage` (survives app restart). On fetch failure, fall back to cache.

---

## 3. Content backend (Supabase) schema

```sql
-- announcements shown on the TV, managed from admin panel
create table announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  lang        text default 'en',          -- 'en' | 'ar' (drives RTL)
  priority    int  default 0,             -- higher = shown first / longer
  starts_at   timestamptz,                -- null = show immediately
  ends_at     timestamptz,                -- null = no expiry
  active      boolean default true,
  created_at  timestamptz default now()
);

-- single-row config table for display settings
create table display_config (
  id              int primary key default 1,    -- enforce single row
  logo_url        text,                          -- points to Storage object
  time_format     text default '12h',            -- '12h' | '24h'
  night_start     text default '22:00',          -- HH:mm, begin dimming
  night_end       text default '05:00',          -- HH:mm, end dimming
  rotate_seconds  int  default 12,               -- announcement rotation
  alert_enabled   boolean default false,
  alert_text      text,
  alert_lang      text default 'en',
  theme           text default 'default',        -- named theme key
  updated_at      timestamptz default now()
);
insert into display_config (id) values (1) on conflict do nothing;

-- Storage bucket: "branding"  (public read) for the logo file
```

**Access model**
- TV app: read-only, via Supabase anon key (RLS: allow `select` on `announcements where active` and on `display_config`; Storage bucket public-read).
- Admin panel: authenticated writes (Supabase Auth — single admin account is fine for v1). RLS: `insert/update/delete` only for authenticated role.
- *Realtime (optional):* subscribe the TV app to `announcements` + `display_config` changes for instant updates instead of 60s polling. Keep the 60s poll as a fallback either way.

---

## 4. TV app — internal architecture

```
src/
  api/
    prayerTimes.ts      // fetch + parse + cache the external API
    content.ts          // fetch announcements + config from Supabase
    cache.ts            // localStorage read/write of last-known-good
  domain/
    schedule.ts         // next-prayer + countdown computation (pure, unit-tested)
    timeOfDay.ts        // maps current time → background phase (dawn/day/dusk/night)
  components/
    PrayerGrid.tsx
    PrayerCard.tsx
    NextPrayerHero.tsx  // big countdown + active prayer
    DateBar.tsx         // hijri + gregorian
    Logo.tsx
    AnnouncementStrip.tsx
    AlertBanner.tsx
    AmbientBackground.tsx   // the signature animated layer
    NightDimmer.tsx     // overlay that lowers brightness on schedule
  hooks/
    useClock.ts         // 1s tick
    usePrayerData.ts    // polls API, exposes merged + cached state
    useContent.ts       // polls/subscribes Supabase
  theme/
    tokens.ts           // palette, type scale, spacing — from DESIGN.md
  App.tsx
```

**Key modules**

- `schedule.ts` (pure functions — these are where bugs hide, so unit-test them):
  - `buildPrayerInstants(resp, now): {name, adhan: Date, iqamah: Date}[]`
  - `nextIqamah(instants, now): {prayer, at: Date}`
  - `countdown(target, now): {h, m, s}`
  - `currentState(instants, now): 'idle' | 'adhan:<P>' | 'iqamah:<P>' | 'inprogress:<P>'`
  - Handle the post-Isha → next-day-Fajr rollover.

- `timeOfDay.ts`: `phase(now, sunrise, prayerInstants): 'dawn'|'day'|'dusk'|'night'` → drives `AmbientBackground` palette. Tie dawn to Fajr/sunrise, dusk to Maghrib, night to Isha.

- `usePrayerData.ts`: on mount, hydrate from `localStorage` cache immediately (instant paint), then fetch, then poll every 60s; on failure, keep cache and mark `stale`.

---

## 5. Countdown & state machine (the tricky core)

```
states: IDLE → ADHAN(P) → IQAMAH(P) → IN_PROGRESS(P) → IDLE(next)

  IDLE        : showing countdown to next iqamah
  ADHAN(P)    : now >= adhan(P) and now < iqamah(P)   → gentle "Adhan — P" highlight + countdown to iqamah
  IQAMAH(P)   : now == iqamah(P) (brief, ~30–60s)     → "Iqamah — P" moment
  IN_PROGRESS : now in [iqamah(P), iqamah(P)+window]  → calm "prayer in progress" (window default 10m, configurable)
  → then recompute next prayer, back to IDLE
```

All transitions derive from comparing `now` to the prayer instants each tick — no timers to drift. Test cases: boundary at each adhan, each iqamah, midnight rollover, Friday Dhuhr→Jummah swap, and a day where the device clock is slightly off.

---

## 6. Admin panel — spec

- **Auth:** Supabase Auth, email+password, single admin user. Gate all writes.
- **Screens:**
  1. *Announcements* — list with active/scheduled badges; create/edit form (title, body, lang EN/AR, priority, start/end date, active toggle); delete.
  2. *Branding* — current logo preview + upload (writes to Storage `branding` bucket, updates `display_config.logo_url`).
  3. *Alert* — toggle `alert_enabled`, edit `alert_text` + `alert_lang`. Big obvious on/off.
  4. *Display settings* — 12h/24h, night-mode start/end, rotation speed, theme.
- **Mobile-first** layout (it lives on a phone). Tailwind is fine here.
- **Feedback:** every save shows a confirmation; the screen the admin controls is named in their terms ("Announcements," "Alert banner," not "rows" or "records").

---

## 7. Packaging (Capacitor → APK)

- `@capacitor/core` + `@capacitor/android`. Build the Vite app, `npx cap copy`, open in Android Studio (or build via Gradle CLI), produce signed `.apk`.
- **Required native behaviors:**
  - **Keep screen on:** `@capacitor-community/keep-awake` (or set `FLAG_KEEP_SCREEN_ON` in the main activity).
  - **Fullscreen / immersive:** hide system/navigation bars (immersive sticky).
  - **Auto-launch on boot:** a `BOOT_COMPLETED` receiver that starts the activity (so a power-cycled stick comes back to the display unattended). Document this as optional if it complicates signing.
  - **Landscape lock.**
  - **Network state awareness:** `@capacitor/network` to know when to surface a discreet "offline — showing last update" marker.
- **Sideload:** enable "apps from unknown sources" on the Fire TV; transfer via **Downloader app** (by URL) or `adb install`. Document both in a `INSTALL.md`.
- **Burn-in:** a `NightDimmer` overlay + a 1px periodic position jitter on static elements during night hours.

> Note: native auto-start-on-boot and immersive flags sometimes need small tweaks to `MainActivity` and the Android manifest. This is the main place a pure-web dev hits friction — budget a little extra time for Phase 5 and let Claude Code generate the manifest/receiver code.

---

## 8. Theming system (feeds the no-AI-look requirement)

`theme/tokens.ts` is generated **from** the `DESIGN.md` deliverable, not invented ad hoc:

```ts
export const tokens = {
  color: {
    // 4–6 NAMED hex values derived from the masjid's real visual world
    // (NOT cream/terracotta, NOT single-neon-on-black). e.g.:
    // mihrabDeep, tileTeal, brassWarm, nightIndigo, dawnRose, ink
  },
  type: {
    displayLatin: '...',   // a deliberate display face (not Inter/Poppins/Playfair-default)
    bodyLatin:    '...',   // a complementary neutral body face
    arabic:       'Amiri' | 'Reem Kufi' | 'Noto Naskh Arabic',
    scale: { hero: '...', prayer: '...', label: '...', meta: '...' }, // 10-ft legibility
  },
  motion: { ambientDurationMs: 60000, reducedMotion: 'respect' },
  radius: { ... }, spacing: { ... },
}
```

Arabic fonts bundled locally (self-hosted woff2), never CDN-only — the TV may not have reliable internet. RTL via `dir="rtl"` on Arabic announcement blocks and the Arabic logo/title if any.

---

## 9. Resilience requirements

- Hydrate UI from `localStorage` cache on launch *before* the first network call (no blank first paint).
- Every fetch wrapped; on error → keep last-known-good, set a `stale` flag, retry on next poll.
- Animation must not leak memory over multi-day runtime (use Framer Motion's declarative loops / CSS where possible; avoid spawning timers; one rAF loop max for the background).
- If the device is low-powered and frame rate drops, `AmbientBackground` falls back to a static gradient of the current time-of-day phase.

---

## 10. Testing

- **Unit:** `schedule.ts` and `timeOfDay.ts` — boundary tests (each adhan/iqamah, midnight rollover, Friday swap, clock skew).
- **Integration:** mock the API + Supabase; assert merged render and cache fallback.
- **Manual on-device:** sideload, run overnight, verify keep-awake, night dimming, offline behavior, and 10-ft legibility from across a room.
- **Design QA:** the design-critic pass (armed with `frontend-design`) confirms it doesn't read as an AI default; manual Arabic/RTL correctness check.

---

## 11. Environment / secrets

```
# TV app (.env)
VITE_PRAYER_API=https://tajweed-website-beige.vercel.app/api/prayer-times
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...      # read-only via RLS

# Admin panel (.env)  — same Supabase project, auth-enabled
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

No secrets in the repo. Anon key is safe to ship in the TV app because RLS restricts it to read-only on public rows.
