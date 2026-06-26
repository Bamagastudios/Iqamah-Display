# Masjid TV — DESIGN.md

The token system for the TV display. Everything visual derives from this file; `apps/tv/src/theme/tokens.ts` is generated from it (not invented ad hoc). This is the Phase 1 deliverable and requires sign-off **before** any styled UI is built.

---

## 0. The brief, pinned

A single masjid's always-on wall display, read from ~10–15 ft in a prayer hall that is often dimly lit. Its one job: **show the next iqamah and the countdown to it, calmly and unmistakably.** Audience: the congregation (zero interaction) + an admin updating from a phone.

The design is grounded in the real material world of a masjid — **lapis-and-brass zellige tilework, the lamplit mihrab niche, and the sky moving through the five prayer times** — not in a generic "elegant" template. Boldness is spent in exactly one place (the signature); everything else stays quiet.

---

## 1. Palette

A lamplit-night jewel palette: a deep lapis hall, warm plaster light, aged brass, tile jade. Dark by intent — a bright canvas glares in a dim hall and risks burn-in — but **deliberately not** "near-black + one neon accent": the base is a saturated indigo-teal and the accents are a harmonized family of metal and tile, never a single acid spike.

### Core (6 named values)

| Token | Hex | Drawn from | Role |
|---|---|---|---|
| `nightLapis` | `#0E2038` | lapis tile / the hall at prayer-time | Base background |
| `inkWell` | `#081320` | the deepest shadow in the niche | Deepest layer — vignette, night-dim target, behind everything |
| `plaster` | `#F2E9D5` | lime-plaster wall under warm light | Primary foreground — names, numerals, high-emphasis |
| `brass` | `#C8A24C` | aged brass lamps & mihrab fittings | Primary accent — the lit niche, the active prayer, the important thing |
| `zellige` | `#2E8E80` | glazed tile jade | Secondary accent — secondary data, the girih mark, geometry |
| `mauveDusk` | `#6F5A80` | the sky band at dawn/dusk | Atmosphere only — the time-of-day gradient; used sparingly |

### Supporting (derived)

| Token | Hex | Role |
|---|---|---|
| `plasterDim` | `#ADA690` | Muted foreground — labels, captions, the quiet 80% of text |
| `brassGlow` | `#EBCB8B` | Light brass — the inner glow of the niche, highlights on the active state |

**Semantic mapping:** `bg.base=nightLapis` · `bg.deep=inkWell` · `fg.primary=plaster` · `fg.muted=plasterDim` · `accent.primary=brass` · `accent.glow=brassGlow` · `accent.secondary=zellige` · `atmosphere=mauveDusk`.

### Time-of-day phases (drives the Phase 3 ambient background)

The base background and a low horizon glow shift with the real time of day; **the niche stays brass-lit in every phase** (the lamp doesn't go out). Phase 1/2 use the Maghrib/night anchor.

| Phase | Tied to | Base | Horizon glow |
|---|---|---|---|
| Dawn | Fajr→sunrise | `#13233E` | `mauveDusk` → `brassGlow`, low and cool-to-warm |
| Day | Dhuhr / Asr | `#173247` | faint high brass warmth; the calmest, "highest" light |
| Dusk | Maghrib | `#0F2038` | a brass + mauve sunset band, low — the richest moment |
| Night | Isha→Fajr | `#0A1828` → `inkWell` | minimal; also the night-dimming state |

---

## 2. Typography

Three faces, each with a meaningful role — the split itself is information: **serif = the human/sacred names, grotesque = precise data & time, Arabic = a real calligraphic naskh.** All self-hosted as subset `woff2` (no CDN — the TV's network is unreliable). None of the AI-tell faces (no Inter / Poppins / Montserrat for everything, no default Playfair "elegance").

| Role | Typeface | License | Used for | Weights |
|---|---|---|---|---|
| **Display** | **Fraunces** (variable, `opsz`) | OFL | Prayer names, the hero "next" name, eyebrows | 400, 600 |
| **Utility / data** | **Hanken Grotesk** (variable) | OFL | The countdown, all times, labels, date, announcements | 400, 500, 700 |
| **Arabic** | **Amiri** | OFL | Arabic prayer names + RTL announcements | 400, 700 |

> Fraunces is a warm, slightly old-style "soft" serif with real character used *with restraint* — not the high-contrast Playfair default. Hanken Grotesk is a quiet humanist grotesque with true tabular figures — **not** Inter. Amiri carries the calligraphic naskh tradition and pairs with both. *Alt on request: swap Amiri → **Reem Kufi** for a geometric Kufi that echoes the tilework (one-line change).*

### Type scale (px at 1920×1080, for 10-ft legibility — the countdown is the loudest thing)

| Token | px | Face / treatment |
|---|---|---|
| `countdown` | **200** | Hanken 500, `tabular-nums`, tracking −0.01em, **brass** — the loudest element |
| `heroName` | 104 | Fraunces 600 (e.g. "Maghrib") |
| `heroArabic` | 72 | Amiri 700 (المغرب) |
| `prayerName` | 46 | Fraunces 600 (grid) |
| `prayerArabic` | 34 | Amiri 700 |
| `time` | 40 | Hanken 500, `tabular-nums` (adhan / iqamah values) |
| `label` | 22 | Hanken 700, uppercase, tracking +0.16em (ADHAN / IQAMAH eyebrows) |
| `date` | 30 | Hanken 500 (gregorian + hijri label) |
| `announce` | 36 | Hanken 400 / Amiri for Arabic |
| `meta` | 22 | Hanken 400, `plasterDim` (sunrise, offline marker) |

Numerals never jitter: tabular figures + each countdown digit rendered in a fixed-width cell.

---

## 3. Space, shape, motion

- **Spacing** (8px base, TV-generous): `4, 8, 16, 24, 40, 64, 96, 128`.
- **Radius** — deliberately **not** zero (dodging the broadsheet-hairline default): `sm 10 · md 20 · lg 32 · pill 999`. The hero niche is a true **ogee arch SVG silhouette**, not a `border-radius` rectangle.
- **Dividers:** almost none. Structure comes from the niche, generous space, and grouping — never newspaper hairline rules.
- **Motion:** one slow ambient layer only (Phase 3), `~60s` loop, gentle ease-in-out. The niche may "breathe" its glow over ~8s. The countdown just ticks (value change, no animation). **`prefers-reduced-motion` → a static gradient of the current phase.** Low-power device → static gradient fallback.

---

## 4. The signature — "Mihrab Light"

> The next-prayer hero sits inside a **pointed ogee-arch niche**, softly **lit from within** by a brass radial glow — the way the mihrab is the lit, ornamented focal point of a real prayer hall. The niche holds the prayer name (Latin + Arabic) and the big brass countdown. It is the one bold, memorable, subject-true device; the rest of the screen is flat and quiet on the night field. At night the niche dims with the hall.

**Secondary motif (restrained, not a second signature):** an **8-point girih star (khatim)** — geometrically constructed, not stock clip-art — used *only* as the small "active prayer" tick and as a very faint, large watermark behind the niche. Used sparingly so it never becomes busy.

No `01 / 02 / 03` numbered markers — the five prayers are named times, not a sequence the reader counts. The only structural labels are the meaningful `ADHAN` / `IQAMAH` eyebrows.

### Wireframe — the Phase-1 styled prayer card

```
   default (idle prayer)              active / "lit" (the next prayer)
 ┌───────────────────────┐          ╭───────────────────────╮
 │ ✦  Maghrib    المغرب  │          │  ✦  Maghrib   المغرب  │   ← brass star tick
 │                       │          │      ·  lit niche  ·   │      + inner brass glow
 │ ADHAN        IQAMAH   │          │  ADHAN        IQAMAH   │
 │ 8:24 PM      8:34 PM  │          │  8:24 PM     ⟦8:34 PM⟧ │   ← iqamah in brass
 └───────────────────────┘          ╰───────────────────────╯
   plaster on nightLapis,             brassGlow rim + faint girih
   plasterDim labels                  watermark; everything else stays quiet
```

### Where the card lives (Phase-2 preview, for context only)

```
 ┌──────────────────────────────────────────────────────────────┐
 │  [logo]                         Monday · 8 Muharram 1448 AH   │
 │                  ╭─────────────────────────╮                  │
 │                  │      ‹ ogee arch ›      │   NEXT           │
 │                  │        Maghrib          │   المغرب         │
 │                  │      0 2 : 4 7 : 1 3    │   ← brass clock  │
 │                  ╰─────────────────────────╯                  │
 │   Fajr    Dhuhr    Asr   [Maghrib]   Isha    ← prayer grid    │
 │  ──────────────────────────────────────────────────────────  │
 │   Community dinner after Maghrib tonight   ← announcement     │
 └──────────────────────────────────────────────────────────────┘
```

---

## 5. Self-critique vs the three AI defaults

1. **Cream + high-contrast serif + terracotta** → Base is deep lapis night, *not* cream; the warm tone is brass **metal**, *not* terracotta; the serif (Fraunces) is a restrained soft-serif, *not* a default Playfair. The only warm light is *plaster as foreground text on dark* — the inverse of the cream-canvas tell. **Avoided.**
2. **Near-black + single neon** → Base `#0E2038` is a saturated indigo-teal, clearly not `#0a0a0a`; accents are a *harmonized family* (brass + jade + dusk-mauve), never one acid spike. Reads as "lamplit masjid," not "dark SaaS." **Avoided.**
3. **Broadsheet hairlines / zero radius** → No hairline rules; structure is the arch + space. Radii are non-zero and the hero is a curved ogee niche. **Avoided.**

**Risks I'm watching:** (a) Islamic geometry can look like clip-art if overused → girih is functional-only, geometrically real, and tiny/faint. (b) brass-on-dark can drift toward "luxury" cliché → countered by the tile jade, the specific lapis (not black-gold), and a *grotesque* (not serif) clock so it reads as a precise prayer board, not a wedding invite.

---

## 6. Font sourcing (on sign-off)

Fraunces, Hanken Grotesk, Amiri are all OFL. Bundle as subset `woff2` under `apps/tv/src/theme/fonts/` (Latin subset for Fraunces/Hanken; Arabic subset for Amiri), `font-display: swap`, `@font-face` self-hosted. Variable woff2 for Fraunces/Hanken (one file each, covers the weights); static 400/700 for Amiri.
