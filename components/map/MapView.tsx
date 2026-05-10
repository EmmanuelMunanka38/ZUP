import { useRef, useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mapService } from '@/services/map.service';
import { loadMapbox, isMapboxAvailable, MapboxLazy } from '@/services/mapbox-loader';
import { Coordinate } from '@/types';
import { useLocationStore } from '@/store/locationStore';
import { MapSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export interface MapViewRef {
  flyTo: (coordinate: Coordinate, zoom?: number) => void;
  fitBounds: (ne: Coordinate, sw: Coordinate, padding?: number) => void;
  getCenter: () => Coordinate | undefined;
}

interface MapViewProps {
  style?: ViewStyle;
  initialCoordinate?: Coordinate;
  zoomLevel?: number;
  onMapPress?: (coordinate: Coordinate) => void;
  onMapLoaded?: () => void;
  children?: React.ReactNode;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
  logoEnabled?: boolean;
  compassEnabled?: boolean;
  showUserLocation?: boolean;
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(function MapView({
  style,
  initialCoordinate,
  zoomLevel = 14,
  onMapPress,
  onMapLoaded,
  children,
  scrollEnabled = true,
  zoomEnabled = true,
  rotateEnabled = false,
  pitchEnabled = false,
  logoEnabled = false,
  compassEnabled = false,
  showUserLocation = false,
}, ref) {
  const cameraRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapboxReady, setMapboxReady] = useState(isMapboxAvailable());
  const currentLocation = useLocationStore((s) => s.currentLocation);

  useEffect(() => {
    if (!mapboxReady) {
      loadMapbox().then((mod) => {
        if (mod) setMapboxReady(true);
      });
    }
  }, [mapboxReady]);

  const defaultCoordinate: Coordinate = initialCoordinate || currentLocation || {
    latitude: -6.7924,
    longitude: 39.2083,
  };

  const flyTo = useCallback((coordinate: Coordinate, zoom?: number) => {
    cameraRef.current?.flyTo(
      [coordinate.longitude, coordinate.latitude],
      800,
    );
    if (zoom) {
      cameraRef.current?.zoomTo(zoom, 800);
    }
  }, []);

  const fitBounds = useCallback((ne: Coordinate, sw: Coordinate, padding = 80) => {
    cameraRef.current?.fitBounds(
      [ne.longitude, ne.latitude],
      [sw.longitude, sw.latitude],
      [padding, padding, padding, padding],
      800,
    );
  }, []);

  const getCenter = useCallback((): Coordinate | undefined => {
    return currentLocation || undefined;
  }, [currentLocation]);

  useImperativeHandle(ref, () => ({
    flyTo,
    fitBounds,
    getCenter,
  }), [flyTo, fitBounds, getCenter]);

  const handlePress = useCallback(
    (feature: any) => {
      if (!onMapPress) return;
      const geometry = feature.geometry;
      if (geometry.type === 'Point') {
        onMapPress({
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
        });
      }
    },
    [onMapPress],
  );

  if (Platform.OS === 'web' || !mapboxReady) {
    return (
      <View style={[styles.container, style]}>
        <MapSkeleton />
        {!mapboxReady && Platform.OS !== 'web' && (
          <View style={styles.fallbackOverlay}>
            <MaterialCommunityIcons name="map-outline" size={48} color={Colors.light['on-surface-variant']} />
            <Text style={[styles.fallbackTitle, { color: Colors.light['on-surface'] }]}>
              Map Unavailable
            </Text>
            <Text style={[styles.fallbackText, { color: Colors.light['on-surface-variant'] }]}>
              Build with expo-dev-client for Mapbox support
            </Text>
          </View>
        )}
      </View>
    );
  }

  const MBMapView = MapboxLazy.MapView;
  const MBCamera = MapboxLazy.Camera;
  const MBUserLocation = MapboxLazy.UserLocation;

  if (!MBMapView || !MBCamera) {
    return <View style={[styles.container, style]}><MapSkeleton /></View>;
  }

  return (
    <View style={[styles.container, style]}>
      <MBMapView
        ref={mapRef}
        style={styles.map}
        styleURL={mapService.getMapStyle('light')}
        onPress={handlePress}
        onDidFinishLoadingMap={() => {
          setIsLoaded(true);
          onMapLoaded?.();
        }}
        scrollEnabled={scrollEnabled}
        zoomEnabled={zoomEnabled}
        rotateEnabled={rotateEnabled}
        pitchEnabled={pitchEnabled}
        logoEnabled={logoEnabled}
        compassEnabled={compassEnabled}
        attributionEnabled={false}
        surfaceView
      >
        <MBCamera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [defaultCoordinate.longitude, defaultCoordinate.latitude],
            zoomLevel,
          }}
          animationMode="flyTo"
          animationDuration={800}
        />

        {showUserLocation && MBUserLocation && (
          <MBUserLocation
            visible
            showsUserHeadingIndicator
            androidRenderMode="gps"
          />
        )}

        {children}
      </MBMapView>

      {!isLoaded && (
        <View style={styles.loadingOverlay}>
          <MapSkeleton />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  fallbackTitle: {
    ...Typography.h2,
    textAlign: 'center',
  },
  fallbackText: {
    ...Typography['body-sm'],
    textAlign: 'center',
  },
});
