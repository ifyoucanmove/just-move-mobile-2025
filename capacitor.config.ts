import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.justmove.supplement',
  appName: 'Just Move Supplement',
  webDir: 'www',
 /*   server: {
     url: 'https://justmove-2eb09.web.app/',
    cleartext: true
   }, */
  plugins: {
    SplashScreen: {
      // how long to show the launch splash (ms)
      launchShowDuration: 500,
      // let the app hide it manually? false = app must call hide()
      launchAutoHide: true,
      // background color used behind the splash image (#RRGGBB or #RRGGBBAA)
      backgroundColor: '#004FFF'
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '975192045133-dhu413ebr9m0d1i3s7sbecvk8acnnha9.apps.googleusercontent.com',
      iosClientId: '975192045133-iq95sofj1atd132kagg3l2r3bgih05ql.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
    FacebookLogin: {
      // Permissions to request from Facebook
      permissions: ['email', 'public_profile']
    }
  }
};

export default config;
