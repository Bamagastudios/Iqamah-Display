import { createClient } from '@supabase/supabase-js';

// Public client credentials for the masjid's Supabase project (branding/config layer).
// The publishable key is RLS-gated and meant to ship in the client; env vars override it.
const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://vnxaeensfsmhcmgoduvd.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_oQyS_eqBWJBIxRNqc2aLkg_FrhN-G7t';

export const supabaseConfigured = Boolean(url && key);
export const supabase = createClient(url, key);
