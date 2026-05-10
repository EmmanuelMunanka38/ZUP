import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { Coordinate } from '@/types';

const ANIMATION_DURATION = 1500;
const UPDATE_THRESHOLD_DISTANCE = 0.0001;

function haversineDistance(a: Coordinate, b: Coordinate): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aVal =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
}

export function useMapAnimations() {
  const animLat = useRef(new Animated.Value(0)).current;
  const animLng = useRef(new Animated.Value(0)).current;
  const animHeading = useRef(new Animated.Value(0)).current;
  const lastLocation = useRef<Coordinate | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const animateToCoordinate = useCallback(
    (coordinate: Coordinate, heading: number, duration = ANIMATION_DURATION) => {
      if (lastLocation.current) {
        const distance = haversineDistance(lastLocation.current, coordinate);
        if (distance < UPDATE_THRESHOLD_DISTANCE) return;
      }

      if (animationRef.current) {
        animationRef.current.stop();
      }

      lastLocation.current = coordinate;

      Animated.parallel([
        Animated.timing(animLat, {
          toValue: coordinate.latitude,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(animLng, {
          toValue: coordinate.longitude,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(animHeading, {
          toValue: heading,
          duration: duration * 0.6,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    },
    [animLat, animLng, animHeading],
  );

  const getAnimatedStyle = useCallback(
    () => ({
      latitude: animLat,
      longitude: animLng,
      heading: animHeading,
    }),
    [animLat, animLng, animHeading],
  );

  return {
    animateToCoordinate,
    getAnimatedStyle,
    animatedValues: { animLat, animLng, animHeading },
  };
}
