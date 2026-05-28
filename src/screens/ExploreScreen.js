import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdBanner from '../components/AdBanner';
import LeafletMap from '../components/LeafletMap';

export default function ExploreScreen({ navigation }) {
  const openCamera = (camera) => navigation.navigate('Camera', { camera });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AdBanner position="top" />
      <View style={styles.mapWrapper}>
        <LeafletMap onSelectCamera={openCamera} style={styles.map} />
      </View>
      <AdBanner position="bottom" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapWrapper: { flex: 1 },
  map: { flex: 1 },
});
