import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.justmove.supplement',
  appName: 'Just Move Supplement',
  webDir: 'www',
  server: {
    url: 'https://justmove-2eb09.web.app/',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      // how long to show the launch splash (ms)
      launchShowDuration: 500,
      // let the app hide it manually? false = app must call hide()
      launchAutoHide: true,
      // background color used behind the splash image (#RRGGBB or #RRGGBBAA)
      backgroundColor: '#004FFF'
    }
  }
};

export default config;
