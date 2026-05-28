/**
 * Handles iOS App Tracking Transparency (ATT) prompt and AdMob initialisation.
 *
 * iOS 14+ requires apps to ask permission before tracking users for personalised
 * ads. Without this, AdMob still shows ads — just non-personalised (lower eCPM).
 *
 * Usage: call requestTrackingAndInitAds() once on app startup, before any ads load.
 */

import { Platform } from 'react-native';

// Fill in your AdMob App ID here (ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX)
// Same value as iosAppId in app.json plugins config
const ADMOB_APP_ID_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX';

let mobileAds, requestTrackingPermissionsAsync;

try {
  mobileAds = require('react-native-google-mobile-ads').default;
} catch (e) { /* not installed yet */ }

try {
  requestTrackingPermissionsAsync =
    require('expo-tracking-transparency').requestTrackingPermissionsAsync;
} catch (e) { /* not installed yet */ }

/**
 * Call this from App.js on first mount.
 * Shows the ATT permission dialog on iOS 14+, then initialises AdMob.
 */
export async function requestTrackingAndInitAds() {
  if (!mobileAds) return; // SDK not installed yet

  try {
    if (Platform.OS === 'ios' && requestTrackingPermissionsAsync) {
      // Small delay so the ATT dialog doesn't appear before the app finishes loading
      await new Promise(r => setTimeout(r, 1000));
      const { status } = await requestTrackingPermissionsAsync();
      console.log('[Ads] ATT status:', status); // 'granted' | 'denied' | 'unavailable'
    }

    // Initialise AdMob — shows ads regardless of ATT status
    // (personalised if granted, non-personalised if denied)
    await mobileAds().initialize();
    console.log('[Ads] AdMob initialised');
  } catch (e) {
    console.warn('[Ads] Init error:', e.message);
  }
}
