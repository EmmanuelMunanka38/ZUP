export async function loadMapbox(): Promise<null> {
  return null;
}

export function getMapbox(): null {
  return null;
}

export function isMapboxAvailable(): boolean {
  return false;
}

export const MapboxLazy = {
  get MapView(): any { return null; },
  get Camera(): any { return null; },
  get MarkerView(): any { return null; },
  get PointAnnotation(): any { return null; },
  get Callout(): any { return null; },
  get ShapeSource(): any { return null; },
  get LineLayer(): any { return null; },
  get UserLocation(): any { return null; },
};
