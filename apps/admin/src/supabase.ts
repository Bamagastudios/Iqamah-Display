import { createClient } from '@supabase/supabase-js';

// Public client credentials for the masjid's Supabase project. The publishable key is
// RLS-gated and safe to ship in the client; env vars override these defaults.
const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://vnxaeensfsmhcmgoduvd.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_oQyS_eqBWJBIxRNqc2aLkg_FrhN-G7t';

export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = createClient(url, anonKey);
