import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.krushisathi.app',
  appName: 'Krushi Sathi',
  webDir: 'dist',
  server: {
    // For production APK, web assets are loaded from local dist/
    // For live reload during development on Android emulator or device, uncomment:
    // url: 'http://10.0.2.2:5173', // or your LAN IP e.g. 'http://192.168.1.100:5173'
    cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#176B3A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#176B3A',
    },
  },
};

export default config;
