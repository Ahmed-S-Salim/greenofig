import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greenofig.app',
  appName: 'GreenoFig',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Handle 404s by serving index.html (for SPA routing)
    allowNavigation: ['*']
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#000000',
    scheme: 'GreenoFig'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
      spinnerColor: '#10b981'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    }
  }
};

export default config;
