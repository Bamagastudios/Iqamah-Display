import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Multi-page: the TV app + two visual preview pages. The previews aren't linked
      // anywhere in production (Vercel rewrites every path to index.html), but building
      // them lets `vite preview` serve them for screenshots.
      input: {
        index: fileURLToPath(new URL('index.html', import.meta.url)),
        preview: fileURLToPath(new URL('preview.html', import.meta.url)),
        preview2: fileURLToPath(new URL('preview2.html', import.meta.url)),
      },
    },
  },
  test: {
    // schedule.ts is pure (Date math only) — a node env keeps tests fast.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
