import React from 'react';
import { Image, StyleSheet } from 'react-native';

const logoSource = require('../../assets/nsw webcam.jpg');

/**
 * NSW Coastal Webcams logo.
 *
 * Props:
 *   size  'large' (default) — HomeScreen header  (~160 × 80)
 *         'small'           — Camera nav bar      (~70 × 35)
 */
export default function AppLogo({ size = 'large' }) {
  const style = size === 'small' ? styles.small : styles.large;
  return (
    <Image
      source={logoSource}
      style={style}
      resizeMode="contain"
      accessibilityLabel="NSW Coastal Webcams"
    />
  );
}

const styles = StyleSheet.create({
  large: {
    width: 220,
    height: 110,
  },
  small: {
    width: 80,
    height: 40,
  },
});
