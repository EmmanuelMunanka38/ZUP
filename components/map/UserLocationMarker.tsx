import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '@/constants/theme';
import { MapboxLazy } from '@/services/mapbox-loader';
import { Coordinate } from '@/types';

interface UserLocationMarkerProps {
  coordinate: Coordinate;
  id?: string;
}

export function UserLocationMarker({
  coordinate,
  id = 'user-location',
}: UserLocationMarkerProps) {
  const MarkerView = MapboxLazy.MarkerView;
  if (!MarkerView) return null;

  return (
    <MarkerView
      id={id}
      coordinate={[coordinate.longitude, coordinate.latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.pulseOne} />
        <View style={styles.pulseTwo} />
        <View style={styles.innerDot}>
          <MaterialCommunityIcons name="map-marker" size={18} color="#ffffff" />
        </View>
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOne: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    opacity: 0.15,
  },
  pulseTwo: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    opacity: 0.25,
  },
  innerDot: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
