# Masjid TV

An always-on prayer-times + announcements display for a single masjid, built to run
fullscreen on a Fire TV / Google TV stick (sideloaded as an APK).

This is a monorepo:

```
apps/tv      The TV display (React 18 + TS + Vite). Ships now.
apps/admin   Phone admin panel (Phase 4).
packages/*   Shared code, introduced when first needed (Phase 4).
docs/        Authoritative product/technical docs (PRD, TRD, build plan, kickoff).
```

Prayer times come from an external API (consumed as-is); announcements / logo / theme
live in Supabase and are merged on the TV at runtime (Phase 4).

## Develop

```bash
npm install            # installs all workspaces
npm test               # unit tests for the TV app (schedule logic)
npm run dev            # run the TV app dev server
npm run build          # typecheck + production build
```

## Phase status

- **Phase 0 (current):** scaffold, real API types, resilient data layer, and a correct
  next-iqamah countdown with the schedule/state-machine logic isolated in tested pure
  functions (`apps/tv/src/domain/schedule.ts`). UI is intentionally unstyled — design
  begins in Phase 1.

See `docs/BUILD_PLAN.md` for the full phased plan.
