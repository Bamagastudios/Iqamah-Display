import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // schedule.ts is pure (Date math only) — a node env keeps tests fast.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
