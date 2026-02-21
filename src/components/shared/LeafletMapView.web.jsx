import React, { useRef, forwardRef, useImperativeHandle, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

function buildHTML(center, zoom, markers) {
  const markersJS = markers
    .map((m) => {
      const label = String(m.label).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const type = m.type || 'default';
      return `addMarker('${m.id}', ${m.latitude}, ${m.longitude}, '${label}', '${m.color}', '${type}');`;
    })
    .join('\n  ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
    .pill-marker {
      color:#fff; padding:5px 12px; border-radius:20px;
      font-size:12px; font-weight:800; border:2.5px solid #fff;
      box-shadow:0 3px 10px rgba(0,0,0,0.3); white-space:nowrap;
      cursor:pointer; transition:transform 0.15s, border-color 0.15s;
      line-height:1.2;
    }
    .self-marker {
      width:44px; height:44px; border-radius:50%;
      border:3px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,0.3);
      display:flex; align-items:center; justify-content:center;
      font-size:18px; cursor:default;
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    zoomControl: false,
    attributionControl: true
  }).setView([${center.lat}, ${center.lng}], ${zoom});

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  var allMarkers = {};

  function createIcon(label, color, type) {
    var html;
    if (type === 'self') {
      html = '<div class="self-marker" style="background:' + color + '">&#128100;</div>';
    } else {
      html = '<div class="pill-marker" style="background:' + color + '">' + label + '</div>';
    }
    return L.divIcon({
      className: '',
      html: html,
      iconSize: type === 'self' ? [44, 44] : [null, null],
      iconAnchor: type === 'self' ? [22, 22] : [20, 14],
    });
  }

  function addMarker(id, lat, lng, label, color, type) {
    if (allMarkers[id]) {
      map.removeLayer(allMarkers[id]);
    }
    var icon = createIcon(label, color, type);
    var mk = L.marker([lat, lng], { icon: icon }).addTo(map);
    if (type !== 'self') {
      mk.on('click', function () {
        window.parent.postMessage(
          JSON.stringify({ type: 'markerPress', id: id }),
          '*'
        );
      });
    }
    allMarkers[id] = mk;
  }

  function highlightMarker(id) {
    Object.keys(allMarkers).forEach(function(mId) {
      var el = allMarkers[mId].getElement();
      if (!el) return;
      var pill = el.querySelector('.pill-marker');
      if (!pill) return;
      if (mId === id) {
        pill.style.transform = 'scale(1.25)';
        pill.style.borderColor = '#FFD700';
        pill.style.zIndex = '9999';
      } else {
        pill.style.transform = '';
        pill.style.borderColor = '#fff';
        pill.style.zIndex = '';
      }
    });
    if (id && allMarkers[id]) {
      map.panTo(allMarkers[id].getLatLng(), { animate: true, duration: 0.5 });
    }
  }

  window.addEventListener('message', function(event) {
    try {
      var data = JSON.parse(event.data);
      if (data.type === 'highlightMarker') {
        highlightMarker(data.id);
      } else if (data.type === 'panTo') {
        map.panTo([data.lat, data.lng], { animate: true });
      }
    } catch(e) {}
  });

  ${markersJS}
</script>
</body>
</html>`;
}

const LeafletMapView = forwardRef(function LeafletMapView(
  { style, center, zoom = 13, markers = [], onMarkerPress },
  ref,
) {
  const iframeRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);

  const html = useMemo(
    () => buildHTML(center, zoom, markers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(markers), center.lat, center.lng, zoom],
  );

  useEffect(() => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [html]);

  useEffect(() => {
    const handler = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'markerPress' && onMarkerPress) {
          onMarkerPress(data.id);
        }
      } catch (_) {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMarkerPress]);

  useImperativeHandle(ref, () => ({
    highlightMarker(id) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ type: 'highlightMarker', id }),
        '*',
      );
    },
    panTo(lat, lng) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ type: 'panTo', lat, lng }),
        '*',
      );
    },
  }));

  return (
    <View style={[StyleSheet.absoluteFillObject, style]}>
      {blobUrl && (
        <iframe
          ref={iframeRef}
          src={blobUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Mapa"
        />
      )}
    </View>
  );
});

export default LeafletMapView;
