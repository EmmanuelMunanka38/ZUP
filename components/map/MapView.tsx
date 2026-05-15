import { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import MapView, { Marker, Polyline, Region, AnimatedRegion, MapPressEvent, UserLocationChangeEvent, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  showUserLocation?: boolean;
}

function coordToRegion(coord: Coordinate, zoom = 14): Region {
  const delta = 0.01 * (16 - zoom + 1);
  return {
    latitude: coord.latitude,
    longitude: coord.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

const DEFAULT_REGION: Region = {
  latitude: -6.7924,
  longitude: 39.2083,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const RNMapView = forwardRef<MapViewRef, MapViewProps>(function RNMapView({
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
  showUserLocation = false,
}, ref) {
  const mapRef = useRef<MapView>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const currentLocation = useLocationStore((s) => s.currentLocation);

  const defaultRegion = initialCoordinate
    ? coordToRegion(initialCoordinate, zoomLevel)
    : currentLocation
      ? coordToRegion(currentLocation, zoomLevel)
      : DEFAULT_REGION;

  const flyTo = useCallback((coordinate: Coordinate, zoom?: number) => {
    mapRef.current?.animateToRegion(coordToRegion(coordinate, zoom || zoomLevel), 800);
  }, [zoomLevel]);

  const fitBounds = useCallback((ne: Coordinate, sw: Coordinate, padding = 80) => {
    mapRef.current?.fitToCoordinates(
      [
        { latitude: ne.latitude, longitude: ne.longitude },
        { latitude: sw.latitude, longitude: sw.longitude },
      ],
      {
        edgePadding: { top: padding, right: padding, bottom: padding, left: padding },
        animated: true,
      },
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

  const handlePress = useCallback((event: MapPressEvent) => {
    if (!onMapPress) return;
    onMapPress({
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude,
    });
  }, [onMapPress]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <MapSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={defaultRegion}
        onPress={handlePress}
        onMapLoaded={() => {
          setIsLoaded(true);
          onMapLoaded?.();
        }}
        scrollEnabled={scrollEnabled}
        zoomEnabled={zoomEnabled}
        rotateEnabled={rotateEnabled}
        pitchEnabled={pitchEnabled}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        mapPadding={Platform.OS === 'ios' ? { top: 0, right: 0, bottom: 0, left: 0 } : undefined}
      >
        {children}
      </MapView>

      {isLoaded && showUserLocation && <View style={styles.userLocationDot} />}
    </View>
  );
});

export function RNMarker({ coordinate, title, description, children }: {
  coordinate: Coordinate;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <Marker
      coordinate={{
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      }}
      title={title}
      description={description}
    >
      {children}
    </Marker>
  );
}

export function RNRoutePolyline({ coordinates, strokeColor = '#006d36', strokeWidth = 4 }: {
  coordinates: Coordinate[];
  strokeColor?: string;
  strokeWidth?: number;
}) {
  if (coordinates.length < 2) return null;
  return (
    <Polyline
      coordinates={coordinates.map((c) => ({
        latitude: c.latitude,
        longitude: c.longitude,
      }))}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      lineCap="round"
      lineJoin="round"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  userLocationDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
});
