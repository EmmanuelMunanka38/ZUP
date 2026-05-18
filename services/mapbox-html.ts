const ICON_MAP: Record<string, string> = {
  store: '🏪',
  bike: '🚴',
  'map-marker': '📍',
  account: '👤',
  food: '🍽️',
};

export function generateMapHTML(accessToken: string, mapStyle: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    .marker {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer; font-size: 18px; line-height: 1;
      border: 2px solid white; transition: transform 0.15s;
    }
    .marker:hover { transform: scale(1.1); }
    .marker-label {
      position: absolute; top: -24px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.7); color: white; padding: 2px 8px;
      border-radius: 4px; font-size: 12px; white-space: nowrap;
      font-family: -apple-system, sans-serif; pointer-events: none;
    }
    .route-line { stroke-linecap: round; stroke-linejoin: round; }
    .mapboxgl-ctrl-attrib { display: none !important; }
    .mapboxgl-ctrl-bottom-right { display: none !important; }
  </style>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css" rel="stylesheet" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = '${accessToken}';

    const map = new mapboxgl.Map({
      container: 'map',
      style: '${mapStyle}',
      center: [39.2083, -6.7924],
      zoom: 14,
      attributionControl: false,
      logoPosition: 'bottom-left',
    });

    const markers = {};
    let routeSourceAdded = false;
    let routeLayerAdded = false;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      map.resize();
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapLoaded' }));
    });

    map.on('click', (e) => {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'mapClick',
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
      }));
    });

    function setCamera(lat, lng, zoom, duration = 1000) {
      map.flyTo({ center: [lng, lat], zoom: zoom || map.getZoom(), duration });
    }

    function updateMarkers(newMarkers) {
      const newIds = new Set(newMarkers.map(m => m.id));
      Object.keys(markers).forEach(id => {
        if (!newIds.has(id)) {
          markers[id].remove();
          delete markers[id];
        }
      });
      newMarkers.forEach(m => {
        if (markers[m.id]) {
          markers[m.id].setLngLat([m.longitude, m.latitude]);
          if (m.rotation !== undefined) {
            const el = markers[m.id].getElement();
            el.style.transform = 'rotate(' + m.rotation + 'deg)';
          }
        } else {
          const icon = window.ICON_MAP && window.ICON_MAP[m.icon] ? window.ICON_MAP[m.icon] : '📍';
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundColor = m.color || '#0fa958';
          el.innerHTML = '<span>' + icon + '</span>';
          if (m.rotation !== undefined) {
            el.style.transform = 'rotate(' + m.rotation + 'deg)';
          }
          if (m.title) {
            const label = document.createElement('div');
            label.className = 'marker-label';
            label.textContent = m.title;
            el.appendChild(label);
          }
          el.addEventListener('click', () => {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerClick', markerId: m.id,
            }));
          });
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([m.longitude, m.latitude])
            .addTo(map);
          markers[m.id] = marker;
        }
      });
    }

    function setRoute(coordinates, color, width) {
      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
        });
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': color || '#0fa958', 'line-width': width || 4 },
        });
      }
      map.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: coordinates },
      });
    }

    function clearRoute() {
      if (map.getSource('route')) {
        map.getSource('route').setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        });
      }
    }

    function fitBounds(neLat, neLng, swLat, swLng, padding) {
      map.fitBounds([[swLng, swLat], [neLng, neLat]], { padding: padding || 80, duration: 1000 });
    }

    window.ICON_MAP = ${JSON.stringify(ICON_MAP)};

    window.addEventListener('message', (event) => {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        switch (msg.type) {
          case 'setCamera':
            setCamera(msg.latitude, msg.longitude, msg.zoom, msg.duration);
            break;
          case 'updateMarkers':
            updateMarkers(msg.markers);
            break;
          case 'setRoute':
            if (msg.coordinates && msg.coordinates.length >= 2) {
              setRoute(msg.coordinates, msg.color, msg.width);
            } else {
              clearRoute();
            }
            break;
          case 'clearRoute':
            clearRoute();
            break;
          case 'fitBounds':
            fitBounds(msg.neLat, msg.neLng, msg.swLat, msg.swLng, msg.padding);
            break;
          case 'resize':
            map.resize();
            break;
        }
      } catch(e) {}
    });

    document.addEventListener('message', (event) => {
      window.dispatchEvent(new MessageEvent('message', { data: event.data }));
    });
  </script>
</body>
</html>`;
}
