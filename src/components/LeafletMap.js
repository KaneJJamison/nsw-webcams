import React from 'react';
import { StyleSheet, Platform, View, Text } from 'react-native';
import { cameras, REGION_COLORS } from '../data/cameras';

let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

// Build the full Leaflet HTML page as a string
function buildMapHtml() {
  const markersJson = JSON.stringify(
    cameras.map(c => ({
      id: c.id,
      name: c.name,
      region: c.region,
      lat: c.lat,
      lng: c.lng,
      color: REGION_COLORS[c.region],
    }))
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #e8f0fe; }
    .cam-label {
      background: transparent;
      border: none;
      box-shadow: none;
    }
    .cam-label-inner {
      font-size: 11px;
      font-weight: 700;
      color: #222;
      white-space: nowrap;
      text-shadow: 0 1px 3px rgba(255,255,255,0.9), 0 -1px 3px rgba(255,255,255,0.9),
                   1px 0 3px rgba(255,255,255,0.9), -1px 0 3px rgba(255,255,255,0.9);
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var cams = ${markersJson};

  var map = L.map('map', { zoomControl: true }).setView([-32.5, 152.0], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  cams.forEach(function(cam) {
    // Coloured circle marker
    var marker = L.circleMarker([cam.lat, cam.lng], {
      radius: 11,
      fillColor: cam.color,
      color: '#ffffff',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.92
    }).addTo(map);

    // Camera icon in the centre
    var icon = L.divIcon({
      className: 'cam-label',
      html: '<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;margin-top:-11px;margin-left:-11px;">&#128247;</div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([cam.lat, cam.lng], { icon: icon, interactive: false }).addTo(map);

    // Name label shown on hover / tap-hold
    marker.bindTooltip(cam.name, {
      permanent: false,
      direction: 'top',
      offset: [0, -14],
      className: '',
    });

    marker.on('click', function() {
      var msg = JSON.stringify({ type: 'camera', id: cam.id });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(msg);
      } else {
        window.parent && window.parent.postMessage(msg, '*');
      }
    });
  });
</script>
</body>
</html>`;
}

const MAP_HTML = buildMapHtml();

export default function LeafletMap({ onSelectCamera, style }) {
  const handleMessage = (e) => {
    try {
      const data = JSON.parse(
        // native WebView fires e.nativeEvent.data; web iframe fires e.data
        e.nativeEvent ? e.nativeEvent.data : e.data
      );
      if (data.type === 'camera' && onSelectCamera) {
        const cam = cameras.find(c => c.id === data.id);
        if (cam) onSelectCamera(cam);
      }
    } catch {}
  };

  if (Platform.OS === 'web') {
    // On web use an iframe with srcdoc
    return (
      <WebIframeMap html={MAP_HTML} onMessage={handleMessage} style={style} />
    );
  }

  return (
    <WebView
      source={{ html: MAP_HTML }}
      style={[styles.map, style]}
      onMessage={handleMessage}
      javaScriptEnabled
      originWhitelist={['*']}
      mixedContentMode="always"
    />
  );
}

// Web-only fallback using an iframe + postMessage listener
function WebIframeMap({ html, onMessage, style }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (typeof e.data === 'string' && e.data.includes('"type":"camera"')) {
        onMessage(e);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  return (
    <View style={[styles.map, style]}>
      <iframe
        ref={ref}
        srcDoc={html}
        style={{ width: '100%', height: '100%', border: 'none' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
