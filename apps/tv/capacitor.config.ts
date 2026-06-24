import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.tajweedusa.masjidtv',
  appName: 'Masjid TV',
  webDir: 'dist',
  server: {
    // Load the live display so updates ship by redeploy — no reinstalling the APK.
    // (Swap back to the bundled layer for a fully offline "final" build later.)
    url: 'https://iqamah-display-admin-4pwk.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
