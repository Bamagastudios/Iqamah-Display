# Masjid TV — Product Requirements Document (PRD)

**Version:** 1.0 (v1 scope)
**Owner:** Hamza / Bamaga Studios
**Status:** Ready to build
**Build method:** Solo vibe-coding via Claude Code

---

## 1. Problem & goal

Masjids display prayer times on a screen at the front of the hall. Most use either a clunky commercial box or a static slide that nobody can update without walking to the TV. The goal: a beautiful, dignified, always-on TV display for **one masjid** that shows live iqamah/adhan times and announcements, is remotely updatable from a phone, runs on a cheap Fire TV / Google TV stick, and looks hand-crafted — not like a generic template.

**Success = ** It runs on the wall for a week untouched, the imam/admin updates announcements from their phone, and people in the hall can read the next iqamah and countdown from across the room.

---

## 2. Users

| User | Needs |
|---|---|
| **Congregation** (in the hall) | Glanceable next prayer, countdown to iqamah, today's full schedule, Jummah time on Friday, current announcements. Zero interaction. |
| **Masjid admin** (you / imam) | Update announcements, swap logo, post an alert, set night dimming — all from a phone, remotely, in seconds. |
| **Installer** (you) | Sideload an APK, point it at the masjid, walk away. |

---

## 3. Data source (authoritative)

Prayer times come from the existing live API:
`GET https://tajweed-website-beige.vercel.app/api/prayer-times`

Confirmed response shape (real sample):
```json
{
  "location": { "latitude": 29.7189, "longitude": -95.6724 },
  "date": "2026-06-22",
  "weekday": "Monday",
  "isFriday": false,
  "sunrise": "06:23", "sunrise12": "6:23 AM",
  "hijri": { "year": 1448, "month": 1, "monthName": "Muharram", "day": 8 },
  "hijriLabel": "8 Muharram 1448 AH",
  "prayers": [
    { "name": "Fajr", "displayName": "Fajr", "adhan": "05:05", "iqamah": "05:45",
      "adhan12": "5:05 AM", "iqamah12": "5:45 AM", "isJummah": false }
    // Dhuhr, Asr, Maghrib, Isha …
  ],
  "jummah": { "iqamah": "13:30", "iqamah12": "1:30 PM" },
  "alerts": []
}
```

Key facts the product depends on:
- Each prayer carries **both** `adhan` and `iqamah`, in 24h and 12h.
- `isFriday` and `jummah` drive the Friday view.
- `hijriLabel` is ready to display as-is.
- `sunrise` is available (useful for shuruq display and for the time-of-day background).
- `alerts` is an array — the API may push its own alerts; the app must render them alongside admin announcements.

The **content layer** (announcements, logo, theme, night-mode, alert banner toggle) lives in a separate backend the admin panel writes to. The app **merges** API data + content data on every refresh.

---

## 4. Features (v1)

### F1 — Live prayer display *(must)*
- Show all five daily prayers with name, adhan time, iqamah time.
- Highlight the **current/next** prayer distinctly.
- Use 12h or 24h format per a config setting (default 12h).

### F2 — Next-iqamah countdown *(must)*
- A prominent live countdown to the **next iqamah** (HH:MM:SS).
- When iqamah time hits: brief "Iqamah — [Prayer]" state, then a calm "prayer in progress" state for a configurable window (default ~10 min), then roll to the next prayer.
- At adhan time: a gentle "Adhan — [Prayer]" highlight.
- Must correctly roll over past midnight (after Isha, next is tomorrow's Fajr).

### F3 — Friday / Jummah view *(must)*
- When `isFriday` is true, replace Dhuhr with Jummah and show `jummah.iqamah` prominently. (If your masjid has multiple Jummah slots later, that's v2.)

### F4 — Date display *(must)*
- Hijri date (`hijriLabel`) + Gregorian date + weekday, always visible.

### F5 — Masjid logo *(must)*
- Display the masjid logo, uploaded via admin panel, stored in backend. Fallback to a bundled default if none set.

### F6 — Announcements *(must)*
- A rotating strip or panel cycling through admin-created announcements.
- Each announcement: title + body, optional start/end date (auto show/hide), optional priority.
- Supports Arabic (RTL) and English text.
- Also surfaces any `alerts` from the API.

### F7 — Alert banner *(should)*
- A single high-visibility banner the admin can toggle on/off (e.g. "Janāzah after Dhuhr today"). Visually distinct from routine announcements.

### F8 — Time-of-day ambient background *(must — it's the signature)*
- A slow, non-distracting animated background whose tone tracks the real time of day (dawn → day → dusk → night), derived from Islamic geometric pattern motifs. Respects reduced-motion.

### F9 — Night dimming *(should)*
- Between configurable hours (e.g. after Isha), reduce brightness/contrast to be easy on the eyes and reduce burn-in.

### F10 — Resilience / offline *(must)*
- Cache last successful API + content fetch. On network failure, keep showing cached data; never blank the screen.

### F11 — Admin panel *(must)*
- Phone-friendly web app. Auth-protected (simple password / Supabase auth).
- CRUD announcements; upload/replace logo; toggle alert banner + set its text; set 12h/24h, night-mode hours, announcement rotation speed.
- Changes reflect on the TV within ≤60s (or instantly if using realtime).

### F12 — Sideloadable APK *(must)*
- Ships as an `.apk` that installs on Fire TV / Google TV, launches fullscreen (immersive, no system bars), keeps the screen awake, and ideally auto-starts on boot.

---

## 5. Non-functional requirements

- **Legibility:** readable at 10 feet on a 1080p screen. Countdown is the loudest element.
- **Always-on:** runs indefinitely; no memory leaks from animation; burn-in mitigation.
- **Performance:** smooth 60fps ambient motion on a low-power TV stick; if the stick struggles, motion auto-degrades gracefully.
- **Refresh cadence:** prayer/content poll every 60s (config). Countdown is local per-second tick (no network).
- **Internationalization:** correct RTL rendering and a proper bundled Arabic webfont; no Latin fallback for Arabic glyphs.
- **Accessibility-minded:** respects `prefers-reduced-motion`; sufficient contrast in every time-of-day state.
- **Privacy:** no congregant data collected. Admin auth only.

---

## 6. Design requirements (explicit — "do not look AI-generated")

- **Must not** ship in any of the three known AI-default looks (cream+serif+terracotta; black+single-neon; broadsheet hairlines).
- **Must** derive palette + the one signature element from the masjid's real visual world (tile geometry, calligraphic tradition, mihrab light), per the `frontend-design` skill.
- **Typography:** deliberate display/body pairing for Latin (no Inter-for-everything, no default Playfair "elegance"); a real Arabic typeface (Amiri / Reem Kufi / Noto Naskh Arabic) for Arabic, properly shaped and RTL.
- **Motion:** one orchestrated ambient layer, slow and dignified; never a busy screensaver.
- **Tone of copy:** calm, plain, in the interface's own voice. Empty/error states give direction, not apology.
- A written `DESIGN.md` token file is a required deliverable before full UI build.

---

## 7. User stories (acceptance-oriented)

1. *As a worshipper,* I glance at the screen and immediately see which prayer is next and how long until iqamah. → countdown + highlight present, legible at distance.
2. *As a worshipper on Friday,* I see the Jummah time clearly instead of Dhuhr. → Friday view triggers on `isFriday`.
3. *As the admin,* I post "Community dinner after Maghrib" from my phone and it appears on the TV within a minute. → admin write → TV reflects ≤60s.
4. *As the admin,* I flip on a janāzah alert banner and it shows distinctly above routine announcements. → F7 banner renders with priority styling.
5. *As the installer,* I sideload the APK and it launches fullscreen and stays awake overnight. → F12 + keep-awake verified.
6. *As anyone in the hall during a wifi outage,* I still see today's times. → cached render, no blank screen.

---

## 8. Out of scope for v1

Multi-masjid config, app-store distribution, ayah/hadith overlays (require scholar sign-off before any Quranic text ships), in-app donations, weather, multi-language UI toggle, multi-screen sync, audio adhan playback through the TV.

---

## 9. Acceptance checklist (v1 "done")

- [ ] Real times from the API render correctly, including 12h format.
- [ ] Countdown is accurate and rolls over midnight and across every prayer boundary.
- [ ] Friday view works.
- [ ] Hijri + Gregorian date correct.
- [ ] Logo loads from backend; default fallback works.
- [ ] Announcements rotate; date-scheduling and RTL both work.
- [ ] Alert banner toggles from phone and shows distinctly.
- [ ] Ambient background tracks time of day and respects reduced-motion.
- [ ] Night dimming engages on schedule.
- [ ] App survives a simulated network drop without blanking.
- [ ] Admin change reaches TV within 60s.
- [ ] APK sideloads, runs fullscreen, stays awake.
- [ ] A design-critic pass confirms it does **not** read as an AI default.
