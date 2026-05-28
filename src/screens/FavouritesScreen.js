import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cameras, REGION_COLORS } from '../data/cameras';
import { useFavourites } from '../context/FavouritesContext';
import AdBanner from '../components/AdBanner';
import AppLogo from '../components/AppLogo';

export default function FavouritesScreen({ navigation }) {
  const { favourites, toggleFavourite } = useFavourites();
  const favCameras = cameras.filter(c => favourites.has(c.id));

  const openCamera = (camera) => navigation.navigate('Camera', { camera });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AdBanner position="top" />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <AppLogo size="large" />
        </View>
        <Text style={styles.pageTitle}>★  My Favourites</Text>
      </View>

      {favCameras.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>☆</Text>
          <Text style={styles.emptyTitle}>No favourites yet</Text>
          <Text style={styles.emptyBody}>
            Tap the ☆ next to any camera on the Home tab to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favCameras}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const color = REGION_COLORS[item.region] || '#1565c0';
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => openCamera(item)}
              >
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={styles.rowInfo}>
                  <Text style={styles.rowText}>{item.name}</Text>
                  <Text style={[styles.rowRegion, { color }]}>{item.region}</Text>
                </View>
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => toggleFavourite(item.id)}
                  style={styles.starBtn}
                >
                  <Text style={styles.starActive}>★</Text>
                </TouchableOpacity>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
        />
      )}

      <AdBanner position="bottom" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  logoRow: { alignItems: 'center', marginBottom: 8 },
  pageTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e67e00',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  list: { paddingBottom: 16 },
  row: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  rowInfo: { flex: 1 },
  rowText: { fontSize: 16, color: '#1a1a1a' },
  rowRegion: { fontSize: 12, marginTop: 2 },
  starBtn: { paddingHorizontal: 6 },
  starActive: { fontSize: 20, color: '#e67e00' },
  arrow: { fontSize: 20, color: '#bbb' },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#efefef',
    marginLeft: 36,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 64, color: '#ddd', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#888', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20 },
});
