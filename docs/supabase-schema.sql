-- Masjid TV — Supabase schema (branding/config layer).
-- Content (announcements/events/prayer times) comes from the website's /api/display.
-- Supabase only stores BRANDING + display settings, edited from the admin panel.
-- Run this in the Supabase SQL editor.

create table if not exists display_config (
  id             int primary key default 1,
  -- the 8-color palette consumed by the TV theme (see theme/theme.ts)
  palette        jsonb not null default jsonb_build_object(
                   'bg','#222831','deep','#171B22','fg','#F6F0E4','fgDim','#B5AD9B',
                   'accent','#1DA0A8','accentGlow','#57C6CB','accent2','#0C4F54','atmos','#E3D7C0',
                   'niche','#1DA0A8','announce','#0C4F54','donate','#0C4F54','jummah','#0C4F54'),
  -- font family choices from the bundled set
  fonts          jsonb not null default jsonb_build_object(
                   'display','Fraunces','body','Hanken Grotesk','arabic','Amiri'),
  logo_url       text,                       -- points to a Storage object in 'branding'
  masjid_name    text default 'Tajweed Institute',
  side_panel     text default 'both',        -- 'announcements' | 'qr' | 'both' | 'off'
  donate_url     text,                       -- the TV renders a QR from this
  ambient_motion boolean default true,
  night_dim      boolean default true,       -- auto-dim overnight (Isha → Fajr)
  prayer_moments boolean default true,       -- full-screen adhān/iqāmah moments
  alert_enabled  boolean default false,      -- high-visibility banner
  alert_text     text,
  updated_at     timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into display_config (id) values (1) on conflict do nothing;

-- Existing installs (table already created before these settings existed): add the
-- newer columns in place. Safe to re-run; no-ops once the columns are present.
alter table display_config add column if not exists night_dim boolean default true;
alter table display_config add column if not exists prayer_moments boolean default true;

-- Access: the TV reads with the anon key; the admin writes when logged in.
alter table display_config enable row level security;

drop policy if exists "display_config public read" on display_config;
create policy "display_config public read"
  on display_config for select using (true);

drop policy if exists "display_config authed write" on display_config;
create policy "display_config authed write"
  on display_config for update to authenticated
  using (true) with check (true);

-- Logo storage bucket (public read; admin uploads).
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

drop policy if exists "branding public read" on storage.objects;
create policy "branding public read"
  on storage.objects for select using (bucket_id = 'branding');

drop policy if exists "branding authed write" on storage.objects;
create policy "branding authed write"
  on storage.objects for insert to authenticated with check (bucket_id = 'branding');

drop policy if exists "branding authed update" on storage.objects;
create policy "branding authed update"
  on storage.objects for update to authenticated using (bucket_id = 'branding');

-- Create your admin login in Supabase → Authentication → Users → Add user
-- (email + password). That account is what logs into the admin panel.
