import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FavouritesProvider } from './src/context/FavouritesContext';
import TabNavigator from './src/navigation/TabNavigator';
import { requestTrackingAndInitAds } from './src/utils/trackingConsent';

export default function App() {
  useEffect(() => {
    // No-op until USE_REAL_ADS = true in AdBanner.js and SDK is installed.
    // Once activated: shows ATT prompt on iOS 14+ then initialises AdMob.
    requestTrackingAndInitAds();
  }, []);

  return (
    <FavouritesProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </FavouritesProvider>
  );
}
