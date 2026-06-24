import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/** False until you set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (.env). */
export const supabaseConfigured = Boolean(url && anonKey);

// Placeholders keep createClient from throwing before the project is configured;
// any real call simply fails until the env vars are set.
export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key');
