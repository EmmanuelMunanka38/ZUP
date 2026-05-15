import { Platform } from 'react-native';

let MapboxModule: any = null;

function ensureLoaded(): void {
  if (MapboxModule !== null) return;
  try {
    const mod = require('@rnmapbox/maps');
    const resolved = mod?.default || mod;
    if (resolved?.MapView) {
      const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
      if (token && resolved.setAccessToken) {
        resolved.setAccessToken(token);
      }
      MapboxModule = resolved;
    }
  } catch {
    MapboxModule = null;
  }
}

export function loadMapbox(): Promise<any> {
  ensureLoaded();
  return Promise.resolve(MapboxModule);
}

export function getMapbox(): any {
  return MapboxModule;
}

export function isMapboxAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  return MapboxModule !== null;
}

export const MapboxLazy = {
  get MapView() { return MapboxModule?.MapView || null; },
  get Camera() { return MapboxModule?.Camera || null; },
  get MarkerView() { return MapboxModule?.MarkerView || null; },
  get PointAnnotation() { return MapboxModule?.PointAnnotation || null; },
  get Callout() { return MapboxModule?.Callout || null; },
  get ShapeSource() { return MapboxModule?.ShapeSource || null; },
  get LineLayer() { return MapboxModule?.LineLayer || null; },
  get UserLocation() { return MapboxModule?.UserLocation || null; },
};
