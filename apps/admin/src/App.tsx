import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from './supabase';
import {
  DEFAULT_CONFIG,
  FONT_OPTIONS,
  PALETTE_FIELDS,
  type DisplayConfig,
  type SidePanel,
} from './types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-ink text-cream">
      <div className="mx-auto max-w-xl px-5 py-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Masjid TV — Admin</h1>
          {session && (
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-sand underline">
              Sign out
            </button>
          )}
        </header>

        {!supabaseConfigured ? (
          <SetupNotice />
        ) : !ready ? (
          <p className="text-sand">Loading…</p>
        ) : !session ? (
          <Login />
        ) : (
          <Editor />
        )}
      </div>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-sand">
      <p className="mb-2 font-medium text-cream">Connect Supabase to begin</p>
      <p>
        Create a free project at supabase.com, run <code>docs/supabase-schema.sql</code>, then set
        <code className="mx-1">VITE_SUPABASE_URL</code> and <code className="mx-1">VITE_SUPABASE_ANON_KEY</code>
        (Vercel env vars or a local <code>.env</code>).
      </p>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sand">Sign in with your admin account.</p>
      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
          required
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
          required
        />
      </Field>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        disabled={busy}
        className="w-full rounded-lg bg-teal py-2.5 font-medium text-ink disabled:opacity-60"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export function Editor({ skipLoad = false }: { skipLoad?: boolean } = {}) {
  const [config, setConfig] = useState<DisplayConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(!skipLoad);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (skipLoad) return;
    (async () => {
      try {
        const { data } = await supabase.from('display_config').select('*').eq('id', 1).maybeSingle();
        if (data) {
          const row = data as DisplayConfig;
          setConfig({
            ...DEFAULT_CONFIG,
            ...row,
            // deep-merge so newly added palette/font keys fall back to defaults
            palette: { ...DEFAULT_CONFIG.palette, ...(row.palette ?? {}) },
            fonts: { ...DEFAULT_CONFIG.fonts, ...(row.fonts ?? {}) },
          });
        }
      } catch {
        // offline / not configured yet — fall back to defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function set<K extends keyof DisplayConfig>(key: K, value: DisplayConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  async function uploadLogo(file: File) {
    setStatus('Uploading logo…');
    const ext = file.name.split('.').pop() || 'png';
    const path = `logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('branding').upload(path, file, { upsert: true });
    if (error) {
      setStatus(`Logo upload failed: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from('branding').getPublicUrl(path);
    set('logo_url', data.publicUrl);
    setStatus('Logo uploaded — remember to Save.');
  }

  async function save() {
    setBusy(true);
    setStatus(null);
    const { error } = await supabase
      .from('display_config')
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq('id', 1);
    setStatus(error ? `Save failed: ${error.message}` : 'Saved — the TV updates within ~15s.');
    setBusy(false);
  }

  if (loading) return <p className="text-sand">Loading settings…</p>;

  return (
    <div className="space-y-8">
      <Section title="Branding">
        <Field label="Masjid name">
          <input
            value={config.masjid_name}
            onChange={(e) => set('masjid_name', e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
          />
        </Field>
        <Field label="Logo">
          <div className="flex items-center gap-3">
            {config.logo_url && (
              <img src={config.logo_url} alt="" className="h-12 w-12 rounded bg-white/10 object-contain" />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
              className="text-sm text-sand"
            />
          </div>
        </Field>
      </Section>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-3">
          {PALETTE_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <input
                type="color"
                value={config.palette[key]}
                onChange={(e) => set('palette', { ...config.palette, [key]: e.target.value })}
                className="h-9 w-9 shrink-0 rounded border border-white/15 bg-transparent"
              />
              <div className="min-w-0">
                <div className="text-sm">{label}</div>
                <div className="truncate font-mono text-xs text-sand">{config.palette[key]}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Fonts">
        {(['display', 'body', 'arabic'] as const).map((role) => (
          <Field key={role} label={role[0].toUpperCase() + role.slice(1)}>
            <select
              value={config.fonts[role]}
              onChange={(e) => set('fonts', { ...config.fonts, [role]: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
            >
              {FONT_OPTIONS[role].map((f) => (
                <option key={f} value={f} className="text-ink">
                  {f}
                </option>
              ))}
            </select>
          </Field>
        ))}
      </Section>

      <Section title="Display">
        <Field label="Side panel">
          <select
            value={config.side_panel}
            onChange={(e) => set('side_panel', e.target.value as SidePanel)}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
          >
            {(['both', 'announcements', 'qr', 'off'] as const).map((v) => (
              <option key={v} value={v} className="text-ink">
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Donate link (QR)">
          <input
            value={config.donate_url ?? ''}
            onChange={(e) => set('donate_url', e.target.value || null)}
            placeholder="https://…/donate"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
          />
        </Field>
        <Toggle label="Ambient background motion" checked={config.ambient_motion} onChange={(v) => set('ambient_motion', v)} />
      </Section>

      <Section title="Alert banner">
        <Toggle label="Show alert banner" checked={config.alert_enabled} onChange={(v) => set('alert_enabled', v)} />
        <Field label="Alert text">
          <input
            value={config.alert_text ?? ''}
            onChange={(e) => set('alert_text', e.target.value || null)}
            placeholder="e.g. Janāzah after Dhuhr today"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
          />
        </Field>
      </Section>

      <div className="sticky bottom-0 -mx-5 border-t border-white/10 bg-ink/95 px-5 py-4 backdrop-blur">
        {status && <p className="mb-2 text-sm text-sand">{status}</p>}
        <button
          onClick={save}
          disabled={busy}
          className="w-full rounded-lg bg-teal py-3 font-semibold text-ink disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-sand">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-teal" />
      <span className="text-sm">{label}</span>
    </label>
  );
}
