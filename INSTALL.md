# Seeing Masjid TV on a real screen

There are two ways to get the display onto your TV. Start with **A** to see the whole
thing working today; **B** is the proper wall-mounted kiosk.

---

## A. See it today (web — 5 minutes, no APK)

The TV app is a normal static web app, so you can put it on any screen with a browser —
including the Fire TV's browser — by deploying it once.

### 1. Deploy `apps/tv` to Vercel
1. Go to <https://vercel.com> → **Add New → Project** → import the GitHub repo
   `Bamagastudios/Iqamah-Display`.
2. Set **Root Directory** to `apps/tv`.
3. Framework preset: **Vite** (auto-detected). Build: `npm run build`, Output: `dist`.
4. (Optional) Add env var `VITE_DISPLAY_FEED=https://tajweedusa.org/api/display`.
5. Deploy. You'll get a URL like `https://masjid-tv-xxxx.vercel.app`.

You can open that URL on your **phone or laptop right now** to see the live display
(ambient motion, rotating announcements, ticking countdown).

### 2. Open it on the Fire TV
- Easiest: install the **Silk Browser** (Amazon Appstore) on the Fire TV, open the URL,
  and use its fullscreen mode. Or install **"Downloader"** (by AFTVnews) and open the URL.
- This is great for previewing. It's a browser, so it has minor chrome and won't
  auto-launch on boot — that's what the APK (below) fixes.

---

## B. The real wall display (sideloaded APK — the product)

This wraps the web app in a thin Android shell (Capacitor). The shell is built, and it:

- launches **fullscreen + immersive** (no status or navigation bars),
- **keeps the screen awake** (never sleeps), locked to **landscape**,
- **auto-starts on boot** — including Fire TV's warm "quick boot" after a power cut,
- **reloads itself when Wi-Fi returns**, so it recovers hands-free if it started before
  the router was back after an outage.

Because building an `.apk` needs the Android SDK, you have two ways to get the file —
neither requires you to learn Android:

### Option B1 — GitHub Actions builds the APK for you (recommended, no local setup)
We add a CI workflow that compiles a **sideloadable debug APK** on every push and
publishes it as a downloadable artifact / release. You just:
1. Open the repo's **Actions** tab → latest "Build APK" run → download `app-debug.apk`.
2. Put it somewhere with a short URL (or use the release link).

### Option B2 — Build locally with Android Studio (one-time ~20 min)
```bash
npm run build -w apps/tv         # build the web app
npx cap sync android             # copy it into the Android project
npx cap open android             # opens Android Studio → Build → Build APK(s)
```

### Sideload onto the Fire TV
1. On the Fire TV: **Settings → My Fire TV → Developer options** → enable
   **Apps from Unknown Sources** (and ADB debugging if you'll use adb).
2. Install the **Downloader** app, enter the APK's URL, download, install. **or**
   from a computer on the same network: `adb connect <tv-ip>` then `adb install app-debug.apk`.
3. **Launch "Masjid TV" once.** It runs fullscreen and stays awake. Launching it once
   also arms the boot receiver, so the display relaunches on its own after a reboot or
   power cut.
4. Disable the screensaver: **Settings → Display & Sounds → Screensaver → Start after →
   Never** (the app already keeps the screen on; this just avoids any Fire TV overlay).
5. Recommended for hands-free running:
   - Set the device sleep to **Never** if your Fire TV offers it
     (**Settings → My Fire TV → Sleep**).
   - After a power cut, give the TV ~1 minute to boot — it relaunches the display itself.

> **One honest limitation:** Fire TV won't let a non-launcher app *replace* the home
> screen, so on boot you may glimpse the Fire TV home for a moment before the display
> comes forward. For a stricter lock (no remote can leave the app), a paid kiosk tool
> like *Fully Kiosk* or an MDM is needed — overkill for a single masjid screen.

> A debug-signed APK installs fine from Unknown Sources for your own masjid. A
> Play-signed release is only needed for store distribution (out of scope for v1).

---

## Quick local run (for development)
```bash
npm install
npm run dev -w apps/tv      # http://localhost:5173
```
