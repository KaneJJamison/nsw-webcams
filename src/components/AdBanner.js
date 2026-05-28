import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/*
  Swap this component for a real ad unit when ready.

  Google AdMob (react-native-google-mobile-ads):
    import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
    const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXX/XXXXXXXX';
    return <BannerAd unitId={adUnitId} size={BannerAdSize.BANNER} />;

  The placeholder below reserves the exact same space (320×50 standard banner).
*/

export default function AdBanner({ position = 'bottom' }) {
  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <Text style={styles.label}>Ad</Text>
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
  top: {
    borderBottomWidth: 1,
  },
  bottom: {
    borderTopWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sub: {
    fontSize: 11,
    color: '#bbb',
  },
});
