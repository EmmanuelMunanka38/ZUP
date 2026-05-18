import { useRef, useCallback, useImperativeHandle, forwardRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { generateMapHTML } from '@/services/mapbox-html';
import { Coordinate } from '@/types';
import { MAPBOX_STYLES } from '@/types';

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  icon?: string;
  color?: string;
  rotation?: number;
}

export interface MapboxMapRef {
  flyTo: (coordinate: Coordinate, zoom?: number, duration?: number) => void;
  fitBounds: (ne: Coordinate, sw: Coordinate, padding?: number) => void;
}

interface MapboxMapProps {
  style?: ViewStyle;
  markers?: MapMarkerData[];
  routePolyline?: {
    coordinates: [number, number][];
    color?: string;
    width?: number;
  };
  initialCamera?: Coordinate & { zoom?: number };
  camera?: Coordinate & { zoom?: number };
  showUserLocation?: boolean;
  onMapPress?: (coordinate: Coordinate) => void;
  onMapLoaded?: () => void;
  onMarkerPress?: (markerId: string) => void;
}

const DAR_CENTER: Coordinate & { zoom: number } = {
  latitude: -6.7924,
  longitude: 39.2083,
  zoom: 14,
};

export const MapboxMap = forwardRef<MapboxMapRef, MapboxMapProps>(function MapboxMap({
  style,
  markers = [],
  routePolyline,
  initialCamera,
  camera,
  onMapPress,
  onMapLoaded,
  onMarkerPress,
}, ref) {
  const webViewRef = useRef<WebView>(null);
  const loadedRef = useRef(false);

  const html = useMemo(() => {
    const accessToken = MAPBOX_ACCESS_TOKEN;
    const mapStyle = MAPBOX_STYLES.light;
    return generateMapHTML(accessToken, mapStyle);
  }, []);

  const postMessage = useCallback((msg: Record<string, unknown>) => {
    webViewRef.current?.postMessage(JSON.stringify(msg));
  }, []);

  useImperativeHandle(ref, () => ({
    flyTo: (coordinate: Coordinate, zoom?: number, duration?: number) => {
      postMessage({
        type: 'setCamera',
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        zoom: zoom || 14,
        duration: duration || 1000,
      });
    },
    fitBounds: (ne: Coordinate, sw: Coordinate, padding?: number) => {
      postMessage({
        type: 'fitBounds',
        neLat: ne.latitude,
        neLng: ne.longitude,
        swLat: sw.latitude,
        swLng: sw.longitude,
        padding: padding || 80,
      });
    },
  }), [postMessage]);

  useEffect(() => {
    if (!loadedRef.current) return;
    postMessage({ type: 'updateMarkers', markers });
  }, [markers, postMessage]);

  useEffect(() => {
    if (!loadedRef.current) return;
    if (routePolyline && routePolyline.coordinates.length >= 2) {
      postMessage({
        type: 'setRoute',
        coordinates: routePolyline.coordinates,
        color: routePolyline.color || '#006d36',
        width: routePolyline.width || 4,
      });
    } else {
      postMessage({ type: 'clearRoute' });
    }
  }, [routePolyline, postMessage]);

  useEffect(() => {
    if (!loadedRef.current) return;
    if (camera) {
      postMessage({
        type: 'setCamera',
        latitude: camera.latitude,
        longitude: camera.longitude,
        zoom: camera.zoom || 14,
        duration: 800,
      });
    }
  }, [camera, postMessage]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      switch (msg.type) {
        case 'mapLoaded':
          loadedRef.current = true;
          onMapLoaded?.();
          if (initialCamera) {
            postMessage({
              type: 'setCamera',
              latitude: initialCamera.latitude,
              longitude: initialCamera.longitude,
              zoom: initialCamera.zoom || 14,
              duration: 0,
            });
          }
          if (markers.length > 0) {
            postMessage({ type: 'updateMarkers', markers });
          }
          if (routePolyline && routePolyline.coordinates.length >= 2) {
            postMessage({
              type: 'setRoute',
              coordinates: routePolyline.coordinates,
              color: routePolyline.color || '#006d36',
              width: routePolyline.width || 4,
            });
          }
          break;
        case 'mapClick':
          onMapPress?.({ latitude: msg.latitude, longitude: msg.longitude });
          break;
        case 'markerClick':
          onMarkerPress?.(msg.markerId);
          break;
      }
    } catch {}
  }, [onMapLoaded, onMapPress, onMarkerPress, initialCamera, markers, routePolyline, postMessage]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.webFallback} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={handleMessage}
        onError={() => {}}
        onHttpError={() => {}}
        geolocationEnabled
        allowFileAccess
        mixedContentMode="always"
        androidLayerType="hardware"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webFallback: {
    flex: 1,
    backgroundColor: '#e8e8e8',
  },
});
