# Masjid TV — Build Plan

**Working title:** Masjid TV (a digital iqamah & announcements display for Google TV / Fire TV)
**Builder:** Solo, vibe-coding through Claude Desktop / Claude Code, in plain English
**Distribution for v1:** Sideload APK to your own masjid's TV stick — no app store
**Data source:** Your own API → `https://tajweed-website-beige.vercel.app/api/prayer-times`
**Admin:** A phone/web admin panel you control remotely

---

## 1. What you're actually building

Two things, not one:

1. **The TV app** — a fullscreen "always-on" display that runs on a Fire TV Stick or Google TV (Chromecast/onn./Shield). It shows the masjid logo, the five daily prayers with adhan + iqamah times, a live countdown to the next iqamah, Jummah times on Fridays, the Hijri date, and a rotating announcements strip. It pulls everything from your API and refreshes itself. It never needs a keyboard — it just runs.

2. **The admin panel** — a separate small web app (opens on your phone) where you push announcements, swap the logo, toggle alerts, and set display preferences. It writes to a tiny backend; the TV reads from it. This is what lets you change the screen from your pocket without touching the TV.

The prayer *times* come from your existing API. The admin panel is for the **content layer** the API doesn't own: announcements, logo, theme, alert banners, brightness/night mode.

---

## 2. Architecture at a glance

```
   ┌──────────────────────┐         ┌───────────────────────────┐
   │   YOUR PHONE          │         │   YOUR API (already live)  │
   │   Admin Panel (web)   │         │   /api/prayer-times        │
   │   - announcements     │         │   adhan + iqamah + hijri   │
   │   - logo upload       │         └─────────────┬─────────────┘
   │   - alerts / theme    │                       │
   └──────────┬───────────┘                        │
              │ writes                              │ reads (every 60s)
              ▼                                     ▼
   ┌──────────────────────┐                ┌──────────────────────┐
   │  CONTENT BACKEND      │  ◄── reads ──  │     TV APP            │
   │  (Supabase/Firebase)  │  announcements │  (Fire TV / Google TV)│
   │  announcements, logo, │     + config   │  fullscreen kiosk     │
   │  theme, alerts        │                │  countdown + display  │
   └──────────────────────┘                └──────────────────────┘
```

The TV app merges two sources every refresh: **prayer times from your API** + **content/config from the backend**. If either is briefly unreachable, it shows the last-known cached copy so the screen never goes blank in the prayer hall.

---

## 3. Tech stack (and why)

### TV app
- **React + TypeScript + Vite** — fast, you already work in this stack, and it's the easiest thing to vibe-code with Claude Code.
- **Packaged for TV with a WebView wrapper.** A masjid display is a *web page that never closes*. Wrapping a polished web app in a thin native Android shell is far less work than learning Android TV's native Leanback UI, and it sideloads as a normal APK. Two clean options:
  - **Capacitor** (recommended) — wraps your React build into an Android APK, gives you a real `.apk` to sideload, supports "keep screen on," and is trivial to rebuild. **This is the path.**
  - PWA-only fallback: host the web app and open it in the TV browser as a kiosk. Works, but a sideloaded APK behaves more like a real app (auto-launch, no browser chrome, screen-wake control), which is what you want for a wall display.
- **Framer Motion** for animation (countdown ticks, announcement transitions, the ambient background). Declarative, GPU-friendly, and easy to keep *subtle* — which is the whole point of not looking AI-generated.
- **No UI component library.** Component kits (shadcn defaults, Material, Chakra) are exactly what makes things "look AI-generated." You'll hand-build a small set of TV-scale components. See §6.

### Admin panel
- **React + TypeScript + Vite** again — same muscle memory.
- **Tailwind is fine here** (admin panel is utilitarian; it can look clean-generic, nobody sees it on the wall).
- Hosted on **Vercel** (you already use it — your API lives there).

### Backend (the content layer)
- **Supabase** — Postgres + storage + a generated REST API + row-level auth, all free-tier. You get: a table for announcements, a table for config (logo URL, theme, night-mode hours), and file storage for the logo. The TV reads it over HTTPS; the admin writes to it. No server to maintain.
  - *Alternative:* Firebase (Firestore + Storage) if you prefer realtime push so the TV updates the instant you hit save. Supabase has realtime too. Either works; **pick Supabase** for the SQL clarity unless you want the instant-push feel, in which case Firestore.

### Why not native Android TV (Kotlin/Leanback)?
Because you're solo, vibe-coding, and your strength is web. Native Leanback buys you store-readiness and D-pad-perfect focus management you don't need for a fixed wall display that nobody navigates. The WebView-in-Capacitor path gets you a sideloadable APK this week instead of next month. If you later go to the store for multiple masjids, *then* reconsider native.

---

## 4. Tooling: agents, skills, and how to drive Claude Code

### Claude Code skills to lean on
- **`frontend-design`** — the most important one for you. It exists specifically to avoid templated, AI-looking output: it forces a real token system (named palette, deliberate type pairing, a "signature" element) before any code is written. **Make Claude Code read and follow this skill on every UI pass.** It directly addresses your "no AI-looking fonts/designs" requirement.
- **`pdf` / `docx`** — only if you later want printed signage or a one-pager for the masjid board. Not needed for the app itself.

### Multi-agent operating model (your existing solo-dev pattern)
You already run a multi-agent Claude Code model with review gates. Apply the same here:
- **Builder agent** — writes the React/Capacitor code.
- **Design-critic agent** — runs *after* each UI milestone, instructed with the `frontend-design` skill, whose only job is to catch anything that "reads as a default" (cream-bg-serif-terracotta, neon-on-black, broadsheet hairlines) and send it back.
- **Arabic/Islamic-accuracy gate** — a manual review by you: prayer name spellings, Arabic glyphs, RTL handling of any Arabic announcement text, and that no Quranic text ships without your scholar sign-off (you already hold this line on your other projects — keep it here too; if you ever add ayah overlays, gate them behind Sheikh Raed's review like QuranClip).

### MCP / connectors that help
- **Supabase MCP** (if available in your setup) so Claude Code can create tables and policies directly.
- **GitHub** — push the repo so Claude Code can iterate against version control (you already publish modules to `Bamagastudios`).

---

## 5. Phased plan (designed for solo vibe-coding)

Each phase is a single, self-contained Claude Code session with a clear "done" check. Don't skip the checks — they're what keep a vibe-coded project from drifting.

### Phase 0 — Skeleton & data (½ day)
- Scaffold React+TS+Vite TV app.
- Fetch from `/api/prayer-times`, render the five prayers as plain unstyled text + a working countdown to the next iqamah.
- **Done when:** the real times show on screen and the countdown ticks down correctly across a prayer boundary.

### Phase 1 — Design system (½–1 day) ← *invoke `frontend-design` here*
- Before any pretty code: produce the token system (palette, display+body+utility type, layout concept, the one signature element). Review it against the skill's "is this a default?" test. **This is where you kill the AI look.**
- **Done when:** you have a written `DESIGN.md` token file you actually like, and a single styled prayer card built from it.

### Phase 2 — Full TV layout (1 day)
- Lay out the whole screen at TV scale (1920×1080, 10-foot viewing): logo, prayer grid, hero "next prayer + countdown," Hijri date, announcement strip.
- Active-prayer highlighting; Jummah swap on Fridays.
- **Done when:** it's legible from across a room and looks like *your masjid*, not a template.

### Phase 3 — Animated background (½ day)
- One ambient, slow, non-distracting motion background (see §6 for the anti-AI direction). Respect reduced-motion. Keep it quiet — it's a prayer hall, not a screensaver demo.
- **Done when:** it adds atmosphere without pulling the eye off the times.

### Phase 4 — Backend + admin panel (1–1.5 days)
- Stand up Supabase (announcements, config, logo storage).
- Build the phone admin panel: add/edit/remove announcements, upload logo, toggle an alert banner, set night-mode hours.
- Wire the TV app to read announcements + config and merge with API data.
- **Done when:** you change an announcement on your phone and it appears on the TV within a minute.

### Phase 5 — Package as APK (½ day)
- Wrap with Capacitor; configure keep-awake, auto-launch on boot, fullscreen/immersive, and offline cache of last-known data.
- **Done when:** the `.apk` sideloads onto your Fire TV stick, launches fullscreen, and survives a wifi blip.

### Phase 6 — Polish & resilience (ongoing)
- Adhan-time and iqamah-time visual states (e.g., a calm "It's time for Maghrib" moment, then a "prayer in progress" state).
- Night dimming, screen burn-in protection (subtle periodic pixel shift), error/empty states written in the interface's own voice.
- **Done when:** it can run for a week untouched.

---

## 6. Design direction — making it NOT look AI-generated

The `frontend-design` skill names the exact traps. For a masjid display specifically, here's the anti-default brief to hand Claude Code:

**Avoid the three AI defaults:** cream background + high-contrast serif + terracotta accent; near-black + one acid-green/vermilion accent; broadsheet hairlines with zero border-radius. These appear *regardless of subject* — they're the tell.

**Ground it in the subject instead.** A masjid display's world is real: the geometry of Islamic tile work (girih, zellige), the calligraphic tradition, the colors of a specific mihrab, the way light falls in a prayer hall. Pull the palette and the signature element from *that*, not from a generic "elegant" template.

**Typography — the thing you care about most:**
- Avoid the fonts that scream "AI made this": Inter/Poppins/Montserrat for everything, or a generic Playfair serif for "elegance."
- For Latin text, choose deliberately — e.g. a humanist or characterful display face paired with a clean neutral body face, not the same family for both.
- For Arabic, use a *real* Arabic typeface with proper shaping — e.g. an open-licensed face like **Amiri**, **Reem Kufi**, or **Noto Naskh Arabic** — never let Arabic render in a Latin fallback. RTL must be handled correctly.
- Set a real type scale for 10-foot legibility (the numbers/countdown are the loudest thing; prayer names quieter; date/announcements quietest).

**Motion:** one orchestrated ambient layer, not scattered effects. Slow. The signature could be a softly shifting geometric tessellation derived from real Islamic patterns, or a gentle gradient that tracks the *actual time of day* (dawn tones near Fajr, deep blue near Isha) — that ties the animation to the subject and is the kind of thing nobody templates.

**Restraint:** spend the boldness in one place (the signature), keep everything else disciplined. A prayer hall display should feel calm and dignified, not like a startup landing page.

---

## 7. Risks & how to dodge them

| Risk | Mitigation |
|---|---|
| Screen goes blank if API/wifi drops mid-salah | Cache last-known data; always render from cache, refresh in background |
| Fire TV sleeps / screensaver kicks in | Capacitor keep-awake + disable device screensaver in setup notes |
| Burn-in on an always-on display | Periodic 1px ambient shift + night dimming |
| "AI look" creeps back in during fast iteration | Design-critic agent pass after every UI phase, armed with `frontend-design` |
| Arabic renders wrong (boxes, LTR, wrong shaping) | Bundle a proper Arabic webfont; test RTL early in Phase 2 |
| Times wrong across midnight / DST | Compute "next prayer" from API timestamps, not device assumptions; test the midnight rollover explicitly |
| Scope creep into multi-masjid before v1 ships | Hard-code your masjid for v1; the backend schema already leaves room to add a masjid_id later |

---

## 8. What ships in v1 (scope lock)

**In:** five daily prayers (adhan + iqamah), live next-iqamah countdown, Jummah on Fridays, Hijri + Gregorian date, masjid logo, rotating announcements, alert banner, time-of-day ambient background, night dimming, phone admin panel, sideloadable APK.

**Out (v2+):** multi-masjid remote config, app-store release, ayah/hadith overlays (would need scholar sign-off), multi-language UI toggle, weather, donation QR, multi-screen sync.
