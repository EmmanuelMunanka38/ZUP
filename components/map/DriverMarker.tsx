import { View, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';
import { MapboxLazy } from '@/services/mapbox-loader';
import { Coordinate } from '@/types';

interface DriverMarkerProps {
  coordinate: Coordinate;
  heading?: number;
  avatar?: string;
  id?: string;
}

export function DriverMarker({
  coordinate,
  avatar,
  id = 'driver-marker',
}: DriverMarkerProps) {
  const MarkerView = MapboxLazy.MarkerView;
  if (!MarkerView) return null;

  return (
    <MarkerView
      id={id}
      coordinate={[coordinate.longitude, coordinate.latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.pulseRing, { borderColor: Colors.light.primary }]} />
        {avatar ? (
          <View style={styles.avatarWrap}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.bikeBadge}>
              <MaterialCommunityIcons name="bike" size={10} color="#ffffff" />
            </View>
          </View>
        ) : (
          <View style={[styles.iconBg, { backgroundColor: Colors.light.primary }]}>
            <MaterialCommunityIcons name="bike" size={22} color="#ffffff" />
          </View>
        )}
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    opacity: 0.3,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: '#ffffff',
    ...Shadows.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
  },
  bikeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    ...Shadows.md,
  },
});
