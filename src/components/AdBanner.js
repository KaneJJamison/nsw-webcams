import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// ADMOB ACTIVATION SWITCH
// When you're ready to go live with real ads:
//   1. Fill in ADMOB_APP_ID and AD_UNIT_IDs below
//   2. Flip USE_REAL_ADS to true
//   3. npm install react-native-google-mobile-ads expo-tracking-transparency
//   4. Add plugin config to app.json (see comments at bottom of this file)
//   5. Run eas build + submit
// ─────────────────────────────────────────────────────────────────────────────
const USE_REAL_ADS = false;

// Your AdMob ad unit IDs — get these from admob.google.com
// Format: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
const AD_UNITS = {
  banner_top:    'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',  // Top banner unit
  banner_bottom: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',  // Bottom banner unit
  banner_mid:    'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',  // Mid-content banner unit
};

// ─────────────────────────────────────────────────────────────────────────────

let BannerAd, BannerAdSize, TestIds;
if (USE_REAL_ADS) {
  try {
    const admob = require('react-native-google-mobile-ads');
    BannerAd    = admob.BannerAd;
    BannerAdSize = admob.BannerAdSize;
    TestIds     = admob.TestIds;
  } catch (e) {
    console.warn('react-native-google-mobile-ads not installed yet');
  }
}

export default function AdBanner({ position = 'bottom' }) {
  const [adFailed, setAdFailed] = useState(false);

  if (!USE_REAL_ADS || !BannerAd || adFailed || Platform.OS === 'web') {
    return <Placeholder position={position} />;
  }

  // Use test IDs in development, real IDs in production
  const unitId = __DEV__
    ? TestIds.BANNER
    : (position === 'top'
        ? AD_UNITS.banner_top
        : position === 'mid'
          ? AD_UNITS.banner_mid
          : AD_UNITS.banner_bottom);

  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setAdFailed(true)}
      />
    </View>
  );
}

function Placeholder({ position }) {
  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <Text style={styles.label}>AD</Text>
      <Text style={styles.sub}>Advertisement</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderColor: '#d8d8d8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  top:    { borderBottomWidth: 1 },
  bottom: { borderTopWidth: 1 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sub: { fontSize: 11, color: '#bbb' },
});

/*
── app.json additions needed when USE_REAL_ADS = true ──────────────────────────

In the "expo" object, add:

  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
        "iosAppId":     "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
      }
    ],
    "expo-tracking-transparency"
  ]

The App ID (~) is different from the Ad Unit ID (/) — get it from:
  AdMob console → Apps → your app → App settings → App ID

─────────────────────────────────────────────────────────────────────────────────
*/
