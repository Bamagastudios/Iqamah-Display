import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.tajweedusa.masjidtv',
  appName: 'Masjid TV',
  webDir: 'dist',
  android: {
    // The web layer is bundled; no cleartext/remote server needed.
    allowMixedContent: false,
  },
};

export default config;
