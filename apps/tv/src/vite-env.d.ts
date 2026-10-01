/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISPLAY_FEED?: string;
  readonly VITE_PRAYER_API?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** DatoCMS read-only Content Delivery token (overrides the built-in default). */
  readonly VITE_DATO_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
