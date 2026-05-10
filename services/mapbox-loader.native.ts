let MapboxGLModule: any = null;
let loadAttempted = false;

export async function loadMapbox(): Promise<any> {
  if (MapboxGLModule) return MapboxGLModule;
  if (loadAttempted) return null;
  loadAttempted = true;

  try {
    const mod = await import('@rnmapbox/maps');
    const { mapService } = await import('./map.service');
    mod.default.setAccessToken(mapService.getAccessToken());
    MapboxGLModule = mod.default;
    return MapboxGLModule;
  } catch {
    return null;
  }
}

export function getMapbox(): any {
  return MapboxGLModule;
}

export function isMapboxAvailable(): boolean {
  return MapboxGLModule !== null;
}

export const MapboxLazy = {
  get MapView(): any | null {
    return MapboxGLModule?.MapView ?? null;
  },
  get Camera(): any | null {
    return MapboxGLModule?.Camera ?? null;
  },
  get MarkerView(): any | null {
    return MapboxGLModule?.MarkerView ?? null;
  },
  get PointAnnotation(): any | null {
    return MapboxGLModule?.PointAnnotation ?? null;
  },
  get Callout(): any | null {
    return MapboxGLModule?.Callout ?? null;
  },
  get ShapeSource(): any | null {
    return MapboxGLModule?.ShapeSource ?? null;
  },
  get LineLayer(): any | null {
    return MapboxGLModule?.LineLayer ?? null;
  },
  get UserLocation(): any | null {
    return MapboxGLModule?.UserLocation ?? null;
  },
};
