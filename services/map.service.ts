import { Platform } from 'react-native';
import { MAPBOX_STYLES } from '@/types';

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export const mapService = {
  getAccessToken(): string {
    return MAPBOX_ACCESS_TOKEN;
  },

  getMapStyle(theme: 'light' | 'dark'): string {
    return theme === 'dark' ? MAPBOX_STYLES.dark : MAPBOX_STYLES.light;
  },

  isNative(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  },

  isWeb(): boolean {
    return Platform.OS === 'web';
  },

  async fetchRoute(
    origin: [number, number],
    destination: [number, number],
  ): Promise<{
    distance: number;
    duration: number;
    polyline: string;
    coordinates: [number, number][];
  } | null> {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson&overview=full`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) return null;

      const route = data.routes[0];
      return {
        distance: route.distance,
        duration: route.duration,
        polyline: JSON.stringify(route.geometry),
        coordinates: route.geometry.coordinates,
      };
    } catch {
      return null;
    }
  },

  async searchAddress(query: string): Promise<{ place_name: string; center: [number, number] }[]> {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=TZ&limit=5`;
      const response = await fetch(url);
      const data = await response.json();
      return data.features || [];
    } catch {
      return [];
    }
  },
};
