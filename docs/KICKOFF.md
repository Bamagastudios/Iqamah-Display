# Kickoff Prompt for Claude Code

Paste the block below into a fresh Claude Code session **in an empty project folder**. It points Claude Code at the right skill, locks the stack, and starts at Phase 0 so you build incrementally with checkpoints instead of one giant unverifiable dump.

---

```
You are my build partner for "Masjid TV" — an always-on prayer-times + announcements
display for a single masjid, running on a Fire TV / Google TV stick, sideloaded as an APK.
I'm a solo developer who works in plain English; you write the code, I review at each phase.

BEFORE WRITING ANY UI CODE: read and follow the `frontend-design` skill. The #1 hard
requirement on this project is that it must NOT look AI-generated. Specifically avoid the
three AI-default looks: (1) cream background + high-contrast serif + terracotta accent,
(2) near-black + single neon accent, (3) broadsheet hairlines / zero radius. Derive the
palette and the one "signature" element from the real visual world of a masjid — Islamic
tile geometry (girih/zellige), calligraphic tradition, mihrab light, the colors of the
sky through the day. Produce a written DESIGN.md token system (named palette of 4–6 hex
values, a deliberate Latin display+body type pairing that is NOT Inter/Poppins/Playfair-
default, a real Arabic typeface — Amiri or Reem Kufi or Noto Naskh Arabic, self-hosted
woff2 — a type scale tuned for 10-foot legibility, and the signature element) and get my
sign-off on it BEFORE building the full UI.

STACK (locked):
- TV app: React 18 + TypeScript + Vite + Framer Motion, packaged with Capacitor → Android APK.
- Admin panel: React 18 + TS + Vite + Tailwind, deployed to Vercel.
- Content backend: Supabase (Postgres + Storage + Auth + Realtime), free tier.
- No UI component library on the TV app (kits are what make things look templated). Hand-build
  a small set of TV-scale components from the DESIGN.md tokens.

DATA:
- Prayer times come from my live API (consume as-is, do not modify):
  GET https://tajweed-website-beige.vercel.app/api/prayer-times
  It returns adhan + iqamah (24h and 12h) for Fajr/Dhuhr/Asr/Maghrib/Isha, an isFriday flag,
  a jummah object, sunrise, a hijriLabel, and an alerts array. Fetch it once now and write the
  TypeScript interfaces from the real response.
- Announcements, logo, theme, alert banner, and display settings live in Supabase and are
  edited from a phone admin panel. The TV app MERGES API data + Supabase content on each refresh.

NON-NEGOTIABLES:
- Never blank the screen: hydrate from localStorage cache on launch, poll every 60s, and on any
  fetch failure keep showing last-known-good data.
- Countdown to the next IQAMAH must be correct across every prayer boundary AND the post-Isha →
  next-day-Fajr rollover. Put the next-prayer/countdown/state-machine logic in PURE functions in
  schedule.ts and write unit tests for the boundaries.
- Arabic must use a real bundled Arabic webfont with correct shaping and RTL — never a Latin fallback.
- Respect prefers-reduced-motion. One slow, dignified ambient background layer whose tone tracks
  the real time of day — not a busy screensaver. It must degrade to a static gradient on low-power devices.
- This is a prayer hall: calm, legible, restrained. Spend boldness only on the signature element.

HOW WE WORK — build in phases, stop for my check at the end of each:
  Phase 0: Scaffold React+TS+Vite. Fetch the real API, render the 5 prayers as plain text + a
           working countdown to next iqamah. DONE = real times show and countdown ticks across a boundary.
  Phase 1: Read `frontend-design`, produce DESIGN.md tokens, get my sign-off, build ONE styled
           prayer card from the tokens. DONE = I like the direction and it's not a default look.
  Phase 2: Full TV layout at 1920×1080 / 10-ft scale: logo, prayer grid, next-prayer hero with
           countdown, date bar (hijri+gregorian), announcement strip; active-prayer highlight;
           Friday→Jummah swap. DONE = legible across a room, looks like a real masjid's display.
  Phase 3: The time-of-day ambient background (the signature). DONE = atmospheric, not distracting.
  Phase 4: Supabase schema (announcements, display_config single-row, branding storage bucket, RLS:
           TV read-only / admin authed writes). Build the phone admin panel (announcements CRUD, logo
           upload, alert banner toggle, display settings). Wire the TV app to read + merge. DONE = I
           change an announcement on my phone and the TV updates within 60s.
  Phase 5: Capacitor wrap → signed APK. Keep-awake, immersive fullscreen, landscape lock, optional
           boot-auto-launch, offline marker. Write INSTALL.md (Downloader-by-URL and adb install).
           DONE = the .apk sideloads on my Fire TV, launches fullscreen, stays awake through a wifi blip.
  Phase 6: Polish — adhan/iqamah/in-progress visual states, night dimming + burn-in jitter, error/empty
           states written in the interface's own calm voice.

After each UI phase, run a DESIGN-CRITIC pass on yourself using `frontend-design`: would a designer say
this reads as a generic AI default? If yes, fix it and tell me what you changed and why.

Do NOT ship any Quranic/ayah text in v1. If we ever add it later, it goes behind scholar sign-off.

Start with Phase 0 now: scaffold the project, fetch the real API, and write the TypeScript interfaces
from the actual response. Show me the result before moving on.
```

---

## How to use this

1. **Empty folder + new Claude Code session.** Paste the block. Let it do Phase 0 only, then check it against the "DONE =" line before saying "continue."
2. **Guard Phase 1.** This is where the no-AI-look battle is won or lost. Don't let it skip straight to a pretty layout — make it produce `DESIGN.md` and show you the tokens first. If the palette comes back cream+terracotta or neon-on-black, reject it and say "that's a default, derive it from real tile geometry / the sky through the day instead."
3. **Use a second agent as the design critic** (your existing multi-agent pattern). After Phases 2 and 3, open a fresh agent, give it the `frontend-design` skill and a screenshot, and ask only: "does this read as a generic AI design? what would you change?" Feed the answer back to the builder.
4. **Phase 5 is the one rough spot** for a web dev — the Android manifest, boot receiver, and immersive flags. Let Claude Code generate them; if the stick won't stay awake or won't go fullscreen, paste the exact symptom back and have it fix the manifest/MainActivity.
5. **Keep the scope lock.** If you feel the pull to add multi-masjid config or store release mid-build, don't — the schema already has room; ship v1 to your own wall first.

## Skills & tooling referenced (so you don't lose them)
- **`frontend-design`** — the anti-AI-look design skill. Invoke it on every UI pass. This is the one that matters for your "no AI fonts/designs" requirement.
- **Design-critic agent** — a second Claude Code agent whose only job is catching default looks.
- **Arabic/Islamic-accuracy gate** — your manual review of prayer spellings, Arabic shaping/RTL, and (if ever added) scholar sign-off on any Quranic text.
- **Supabase MCP / GitHub connector** — if available in your setup, let Claude Code create tables and push the repo directly.
- **`docx` / `pdf` skills** — only if you later want a printed install sheet or a one-pager for the masjid board.
