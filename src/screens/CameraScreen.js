import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { REGION_COLORS } from '../data/cameras';
import { useFavourites } from '../context/FavouritesContext';
import AdBanner from '../components/AdBanner';

let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

// Scales content to device width, then posts the scaled body height back
const makeFitScript = () => `
(function() {
  function applyFit() {
    var bodyW = Math.max(
      document.body ? document.body.scrollWidth : 0,
      document.documentElement ? document.documentElement.scrollWidth : 0
    );
    var viewW = window.innerWidth || screen.width;
    if (!bodyW) return;
    var scale = bodyW > viewW ? (viewW / bodyW) : 1;
    var m = document.querySelector('meta[name="viewport"]');
    if (!m) {
      m = document.createElement('meta');
      m.name = 'viewport';
      document.head.appendChild(m);
    }
    m.content = 'width=' + bodyW + ', initial-scale=' + scale.toFixed(4) + ', maximum-scale=3, user-scalable=yes';
    setTimeout(function() {
      var h = document.documentElement.scrollHeight || document.body.scrollHeight;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: Math.ceil(h * scale) }));
      }
    }, 300);
  }
  if (document.readyState === 'complete') applyFit();
  else window.addEventListener('load', applyFit);
  setTimeout(applyFit, 800);
})();
true;
`;

// Approximate native widget dimensions for the web iframe fallback
const WIDGET = {
  video:   { width: 650, height: 420 },
  weather: { width: 820, height: 720 },
};

function iframeLayout(type, containerWidth) {
  const { width, height } = WIDGET[type];
  const scale = Math.min(1, containerWidth / width);
  return { scale, scaledHeight: Math.ceil(height * scale) };
}

function LoadingOverlay({ color, label }) {
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={color} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export default function CameraScreen({ route }) {
  const { camera } = route.params;
  const regionColor = REGION_COLORS[camera.region];
  const { favourites, toggleFavourite } = useFavourites();
  const isFav = favourites.has(camera.id);

  const screenWidth = Dimensions.get('window').width;
  const [videoLoading, setVideoLoading]   = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [videoHeight, setVideoHeight]     = useState(null);
  const [weatherHeight, setWeatherHeight] = useState(null);

  const videoUrl   = `https://widget.coastalcoms.com/video/${camera.videoId}`;
  const weatherUrl = `https://widget.coastalcoms.com/weather/${camera.weatherId}`;

  const videoFrame   = iframeLayout('video', screenWidth);
  const weatherFrame = iframeLayout('weather', screenWidth);

  const onMessage = (setter) => (e) => {
    try {
      const { type, value } = JSON.parse(e.nativeEvent.data);
      if (type === 'height' && value > 50) setter(value);
    } catch {}
  };

  const fitScript = makeFitScript();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.topRow}>
        <View style={[styles.regionBadge, { backgroundColor: regionColor + '20', borderColor: regionColor + '40' }]}>
          <View style={[styles.regionDot, { backgroundColor: regionColor }]} />
          <Text style={[styles.regionText, { color: regionColor }]}>{camera.region}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavourite(camera.id)} style={styles.favBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.favStar, isFav && styles.favStarActive]}>
            {isFav ? '★' : '☆'}
          </Text>
          <Text style={[styles.favLabel, isFav && styles.favLabelActive]}>
            {isFav ? 'Saved' : 'Favourite'}
          </Text>
        </TouchableOpacity>
      </View>

      <AdBanner position="top" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ── Live Camera ── */}
        <View style={[styles.widgetWrapper, { height: videoHeight || videoFrame.scaledHeight }]}>
          {videoLoading && <LoadingOverlay color={regionColor} label="Loading camera..." />}
          {Platform.OS === 'web' ? (
            <iframe
              key={videoUrl}
              src={videoUrl}
              style={{
                position: 'absolute', top: 0, left: 0, border: 'none',
                width:  `${(1 / videoFrame.scale) * 100}%`,
                height: `${(1 / videoFrame.scale) * 100}%`,
                transform: `scale(${videoFrame.scale})`,
                transformOrigin: 'top left',
              }}
              onLoad={() => setVideoLoading(false)}
              allow="autoplay; fullscreen"
            />
          ) : (
            <WebView
              source={{ uri: videoUrl }}
              style={StyleSheet.absoluteFill}
              onLoadEnd={() => setVideoLoading(false)}
              onMessage={onMessage(setVideoHeight)}
              injectedJavaScript={fitScript}
              javaScriptEnabled
              domStorageEnabled
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              scalesPageToFit={false}
            />
          )}
        </View>

        {/* ── Mid-page ad ── */}
        <AdBanner position="bottom" />

        {/* ── Section divider ── */}
        <View style={[styles.sectionHeader, { borderLeftColor: regionColor }]}>
          <Text style={[styles.sectionTitle, { color: regionColor }]}>Weather & Conditions</Text>
        </View>

        {/* ── Weather ── */}
        <View style={[styles.widgetWrapper, { height: weatherHeight || weatherFrame.scaledHeight }]}>
          {weatherLoading && <LoadingOverlay color={regionColor} label="Loading weather..." />}
          {Platform.OS === 'web' ? (
            <iframe
              key={weatherUrl}
              src={weatherUrl}
              style={{
                position: 'absolute', top: 0, left: 0, border: 'none',
                width:  `${(1 / weatherFrame.scale) * 100}%`,
                height: `${(1 / weatherFrame.scale) * 100}%`,
                transform: `scale(${weatherFrame.scale})`,
                transformOrigin: 'top left',
              }}
              onLoad={() => setWeatherLoading(false)}
              allow="autoplay; fullscreen"
            />
          ) : (
            <WebView
              source={{ uri: weatherUrl }}
              style={StyleSheet.absoluteFill}
              onLoadEnd={() => setWeatherLoading(false)}
              onMessage={onMessage(setWeatherHeight)}
              injectedJavaScript={fitScript}
              javaScriptEnabled
              domStorageEnabled
              scalesPageToFit={false}
            />
          )}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            For situational awareness only. Do not rely solely on this feed for safety decisions.
          </Text>
        </View>
      </ScrollView>

      <AdBanner position="bottom" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
  },
  favBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favStar: {
    fontSize: 22,
    color: '#ccc',
  },
  favStarActive: {
    color: '#e67e00',
  },
  favLabel: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
  },
  favLabelActive: {
    color: '#e67e00',
  },
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  regionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  regionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  widgetWrapper: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  sectionHeader: {
    borderLeftWidth: 3,
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    color: '#888',
    fontSize: 14,
  },
  disclaimer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#fffbea',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0e68c',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#7a6500',
    textAlign: 'center',
  },
});
