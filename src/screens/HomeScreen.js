import React, { useState } from 'react';
import {
  View, Text, SectionList, TouchableOpacity,
  StyleSheet, TextInput, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cameras, getCamerasByRegion, REGION_COLORS } from '../data/cameras';
import { useFavourites } from '../context/FavouritesContext';
import AdBanner from '../components/AdBanner';
import AppLogo from '../components/AppLogo';
import FavouritesCarousel from '../components/FavouritesCarousel';

const allSections = getCamerasByRegion();
const REGIONS = ['All', 'Alpine Waters', 'North Coast', 'Hunter Region', 'South Coast'];
const REGION_FILTER_COLORS = {
  'All': '#0B5CAB',
  'Alpine Waters': REGION_COLORS['Alpine Waters'],
  'North Coast': REGION_COLORS['North Coast'],
  'Hunter Region': REGION_COLORS['Hunter Region'],
  'South Coast': REGION_COLORS['South Coast'],
};

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const { favourites, toggleFavourite } = useFavourites();

  const favCameras = cameras.filter(c => favourites.has(c.id));

  // First filter by region, then filter by search
  const baseSections = activeRegion === 'All'
    ? allSections
    : allSections.filter(s => s.region === activeRegion);

  const sections = search.trim()
    ? baseSections
        .map(s => ({
          ...s,
          data: s.data.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter(s => s.data.length > 0)
    : baseSections;

  const openCamera = (camera) => navigation.navigate('Camera', { camera });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AdBanner position="top" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <AppLogo size="large" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search location..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Region filter tabs */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {REGIONS.map(region => {
            const color = REGION_FILTER_COLORS[region] || '#0B5CAB';
            const isActive = activeRegion === region;
            return (
              <TouchableOpacity
                key={region}
                style={[
                  styles.filterPill,
                  isActive
                    ? { backgroundColor: color, borderColor: color }
                    : { backgroundColor: '#fff', borderColor: color + '88' },
                ]}
                onPress={() => setActiveRegion(region)}
                activeOpacity={0.75}
              >
                <Text style={[
                  styles.filterPillText,
                  { color: isActive ? '#fff' : color },
                ]}>
                  {region}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          favCameras.length > 0 && !search.trim() && activeRegion === 'All'
            ? <FavouritesCarousel cameras={favCameras} onSelect={openCamera} />
            : null
        }
        renderSectionHeader={({ section }) => (
          activeRegion === 'All' ? (
            <View style={[styles.sectionHeader, { borderLeftColor: section.color }]}>
              <Text style={[styles.sectionTitle, { color: section.color }]}>
                {section.region}
              </Text>
            </View>
          ) : null
        )}
        renderItem={({ item, section }) => {
          const isFav = favourites.has(item.id);
          return (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => openCamera(item)}
            >
              <View style={[styles.dot, { backgroundColor: section.color }]} />
              <Text style={styles.rowText}>{item.name}</Text>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => toggleFavourite(item.id)}
                style={styles.starBtn}
              >
                <Text style={[styles.star, isFav && styles.starActive]}>
                  {isFav ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
      />

      <AdBanner position="bottom" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  logoRow: { alignItems: 'center', marginBottom: 10 },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#1a1a1a',
  },
  filterBar: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
    paddingTop: 2,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  list: { paddingBottom: 16 },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    borderLeftWidth: 3,
    marginLeft: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  rowText: { flex: 1, fontSize: 16, color: '#1a1a1a' },
  starBtn: { paddingHorizontal: 6 },
  star: { fontSize: 20, color: '#ccc' },
  starActive: { color: '#e67e00' },
  arrow: { fontSize: 20, color: '#bbb' },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#efefef',
    marginLeft: 36,
  },
});
