import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import { REGION_COLORS } from '../data/cameras';

let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

const { width: SW } = Dimensions.get('window');
const CARD_W  = SW - 32;   // 16px margin each side
const FEED_H  = 220;
const INFO_H  = 52;
const SNAP    = CARD_W + 12;

const FIT_SCRIPT = `
(function(){
  function fit(){
    var bw=Math.max(document.body?document.body.scrollWidth:0,document.documentElement?document.documentElement.scrollWidth:0);
    var vw=window.innerWidth||screen.width;
    if(!bw||bw<=vw)return;
    var s=(vw/bw).toFixed(4);
    var m=document.querySelector('meta[name="viewport"]');
    if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}
    m.content='width='+bw+', initial-scale='+s+', maximum-scale=3, user-scalable=yes';
  }
  fit(); setTimeout(fit,600);
})(); true;
`;

export default function FavouritesCarousel({ cameras, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!cameras || cameras.length === 0) return null;

  return (
    <View style={styles.wrapper}>

      <FlatList
        data={cameras}
        horizontal
        pagingEnabled={false}
        snapToInterval={SNAP}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP);
          setActiveIndex(Math.max(0, Math.min(idx, cameras.length - 1)));
        }}
        renderItem={({ item }) => {
          const color = REGION_COLORS[item.region] || '#1565c0';
          const videoUrl = `https://widget.coastalcoms.com/video/${item.videoId}`;
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.93}
              onPress={() => onSelect(item)}
            >
              {/* Live feed area */}
              <View style={styles.feed}>
                {Platform.OS === 'web' ? (
                  <iframe
                    key={videoUrl}
                    src={videoUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay"
                  />
                ) : (
                  <WebView
                    source={{ uri: videoUrl }}
                    style={StyleSheet.absoluteFill}
                    injectedJavaScript={FIT_SCRIPT}
                    javaScriptEnabled
                    domStorageEnabled
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback
                    scalesPageToFit={false}
                  />
                )}

                {/* LIVE badge */}
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              {/* Info bar */}
              <View style={styles.infoBar}>
                <View style={[styles.regionPill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                  <Text style={[styles.regionPillText, { color }]}>{item.region}</Text>
                </View>
                <Text style={styles.camName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.tapHint}>Tap for weather ›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Page dots */}
      {cameras.length > 1 && (
        <View style={styles.dots}>
          {cameras.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_W,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0d1b2a',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  feed: {
    width: CARD_W,
    height: FEED_H,
    backgroundColor: '#0d1b2a',
    overflow: 'hidden',
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoBar: {
    height: INFO_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  regionPill: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  regionPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  camName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  tapHint: {
    fontSize: 11,
    color: '#aaa',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 4,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  dotActive: {
    backgroundColor: '#e67e00',
    width: 18,
  },
});
