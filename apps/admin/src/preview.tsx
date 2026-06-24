import { createRoot } from 'react-dom/client';
import './index.css';
import { Editor } from './App';

// Renders just the config editor (no auth) so the form can be reviewed without Supabase.
createRoot(document.getElementById('root')!).render(
  <div className="min-h-screen bg-ink text-cream">
    <div className="mx-auto max-w-xl px-5 py-8">
      <h1 className="mb-8 text-2xl font-semibold">Masjid TV — Admin</h1>
      <Editor skipLoad />
    </div>
  </div>,
);
