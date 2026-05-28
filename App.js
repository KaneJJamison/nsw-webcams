import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FavouritesProvider } from './src/context/FavouritesContext';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
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
