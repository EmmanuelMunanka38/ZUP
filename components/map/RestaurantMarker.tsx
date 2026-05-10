import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography } from '@/constants/theme';
import { MapboxLazy } from '@/services/mapbox-loader';
import { Coordinate } from '@/types';

interface RestaurantMarkerProps {
  coordinate: Coordinate;
  name?: string;
  rating?: number;
  image?: string;
  id?: string;
  isSelected?: boolean;
  deliveryTime?: string;
}

export function RestaurantMarker({
  coordinate,
  name,
  rating,
  image,
  id = 'restaurant-marker',
  isSelected = false,
  deliveryTime,
}: RestaurantMarkerProps) {
  const MarkerView = MapboxLazy.MarkerView;
  if (!MarkerView) return null;

  return (
    <MarkerView
      id={id}
      coordinate={[coordinate.longitude, coordinate.latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={[styles.container, isSelected && styles.selected]}>
        {image ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        ) : (
          <View style={[styles.iconWrap, { backgroundColor: Colors.light['secondary-container'] }]}>
            <MaterialCommunityIcons
              name="store"
              size={20}
              color={Colors.light['on-secondary-container']}
            />
          </View>
        )}
        {name && (
          <View style={[styles.label, isSelected && styles.labelSelected]}>
            <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
              {name}
            </Text>
            {rating && (
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={12} color={Colors.light['secondary-container']} />
                <Text style={styles.rating}>{rating}</Text>
              </View>
            )}
          </View>
        )}
        {deliveryTime && (
          <View style={styles.timeBadge}>
            <MaterialCommunityIcons name="clock-outline" size={10} color={Colors.light['primary-container']} />
            <Text style={styles.timeText}>{deliveryTime}</Text>
          </View>
        )}
        <View style={styles.arrow} />
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  selected: {
    zIndex: 100,
  },
  imageWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: Colors.light.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  labelSelected: {
    backgroundColor: Colors.light.primary,
  },
  name: {
    ...Typography['label-sm'],
    color: Colors.light['on-surface'],
    maxWidth: 100,
  },
  nameSelected: {
    color: Colors.light['on-primary'],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    ...Typography['label-sm'],
    color: Colors.light['on-surface'],
    fontSize: 11,
  },
  timeBadge: {
    backgroundColor: Colors.light['surface-container-lowest'],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    color: Colors.light['primary-container'],
    fontWeight: '600',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.light.surface,
    marginTop: -1,
  },
});
