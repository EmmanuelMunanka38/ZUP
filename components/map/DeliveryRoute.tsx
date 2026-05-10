import { Colors } from '@/constants/theme';
import { MapboxLazy } from '@/services/mapbox-loader';
import { Coordinate } from '@/types';

interface DeliveryRouteProps {
  origin: Coordinate;
  destination: Coordinate;
  coordinates?: Coordinate[];
  color?: string;
  width?: number;
  id?: string;
}

export function DeliveryRoute({
  origin,
  destination,
  coordinates,
  color = Colors.light.primary,
  width = 4,
  id = 'delivery-route',
}: DeliveryRouteProps) {
  const ShapeSource = MapboxLazy.ShapeSource;
  const LineLayer = MapboxLazy.LineLayer;

  if (!ShapeSource || !LineLayer) return null;

  if (!coordinates || coordinates.length < 2) {
    const defaultCoords: [number, number][] = [
      [origin.longitude, origin.latitude],
      [destination.longitude, destination.latitude],
    ];

    return (
      <ShapeSource
        id={`${id}-source`}
        shape={{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: defaultCoords,
          },
          properties: {},
        }}
      >
        <LineLayer
          id={`${id}-layer`}
          style={{
            lineColor: color,
            lineWidth: width,
            lineOpacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </ShapeSource>
    );
  }

  const routeCoordinates: [number, number][] = coordinates.map((c) => [
    c.longitude,
    c.latitude,
  ]);

  return (
    <>
      <ShapeSource
        id={`${id}-source`}
        shape={{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates,
          },
          properties: {},
        }}
      >
        <LineLayer
          id={`${id}-layer-bg`}
          style={{
            lineColor: color,
            lineWidth: width + 2,
            lineOpacity: 0.2,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        <LineLayer
          id={`${id}-layer`}
          style={{
            lineColor: color,
            lineWidth: width,
            lineOpacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </ShapeSource>
    </>
  );
}
