import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';
import { MapboxLazy } from '@/services/mapbox-loader';
import { Coordinate } from '@/types';

interface AnimatedCarMarkerProps {
  coordinate: Coordinate;
  heading?: number;
  color?: string;
  id?: string;
}

export function AnimatedCarMarker({
  coordinate,
  heading = 0,
  color = Colors.light.primary,
  id = 'driver-marker',
}: AnimatedCarMarkerProps) {
  const rotation = useRef(new Animated.Value(heading)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: heading,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [heading, rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const MarkerView = MapboxLazy.MarkerView;
  if (!MarkerView) return null;

  return (
    <MarkerView
      id={id}
      coordinate={[coordinate.longitude, coordinate.latitude]}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.markerWrapper}>
        <View style={[styles.pulseOuter, { backgroundColor: color + '40' }]}>
          <View style={[styles.pulseInner, { backgroundColor: color }]} />
        </View>
        <Animated.View
          style={[
            styles.carContainer,
            { transform: [{ rotate: rotateInterpolate }] },
          ]}
        >
          <View style={[styles.carIconBg, { backgroundColor: color }]}>
            <MaterialCommunityIcons
              name="car-side"
              size={22}
              color="#ffffff"
            />
          </View>
        </Animated.View>
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  markerWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOuter: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    opacity: 0.15,
  },
  carContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carIconBg: {
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
