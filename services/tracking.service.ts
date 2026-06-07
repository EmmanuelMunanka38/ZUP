import { io, Socket } from 'socket.io-client';
import { Coordinate, DriverLocation, DeliveryRoute, TrackingUpdate, OrderTrackingStatus } from '@/types';
import { mapService } from './map.service';
import { useAuthStore } from '@/store/authStore';

type TrackingCallback = (update: TrackingUpdate) => void;
type ConnectionCallback = (connected: boolean) => void;

const STATUS_SEQUENCE: OrderTrackingStatus[] = [
  'restaurant_confirmed',
  'preparing_order',
  'driver_assigned',
  'driver_arriving',
  'picked_up',
  'on_the_way',
  'delivered',
];

const STATUS_LABELS: Record<OrderTrackingStatus, string> = {
  restaurant_confirmed: 'Restaurant Confirmed',
  preparing_order: 'Preparing Order',
  driver_assigned: 'Driver Assigned',
  driver_arriving: 'Driver Arriving',
  picked_up: 'Picked Up',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
};

const SOCKET_STATUS_MAP: Record<string, OrderTrackingStatus> = {
  confirmed: 'restaurant_confirmed',
  preparing: 'preparing_order',
  on_the_way: 'on_the_way',
  arrived: 'driver_arriving',
  delivered: 'delivered',
};

class TrackingService {
  private socket: Socket | null = null;
  private listeners: Set<TrackingCallback> = new Set();
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private _isConnected = false;
  private _currentTracking: Map<string, TrackingUpdate> = new Map();
  private simulationTimer: ReturnType<typeof setInterval> | null = null;
  private _orderId: string | null = null;
  private _simOptions: { restaurantLocation?: Coordinate; customerLocation?: Coordinate } | null = null;

  get isConnected(): boolean {
    return this._isConnected;
  }

  getStatusLabel(status: OrderTrackingStatus): string {
    return STATUS_LABELS[status];
  }

  get statusSequence(): OrderTrackingStatus[] {
    return STATUS_SEQUENCE;
  }

  getStatusIndex(status: OrderTrackingStatus): number {
    return STATUS_SEQUENCE.indexOf(status);
  }

  connect(orderId: string, url?: string, options?: { restaurantLocation?: Coordinate; customerLocation?: Coordinate }): void {
    this._orderId = orderId;
    this._simOptions = options || null;

    if (this.socket?.connected) {
      this.socket.emit('track:order', orderId);
      return;
    }

    const baseUrl = url || process.env.EXPO_PUBLIC_API_URL || 'https://zup-backend-dhkw.onrender.com';
    const token = useAuthStore.getState().token;

    try {
      this.socket = io(baseUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
      });

      this.socket.on('connect', () => {
        this._isConnected = true;
        this.connectionListeners.forEach((cb) => cb(true));
        if (this._orderId) {
          this.socket?.emit('track:order', this._orderId);
        }
      });

      this.socket.on('disconnect', () => {
        this._isConnected = false;
        this.connectionListeners.forEach((cb) => cb(false));
      });

      this.socket.on('driver:location', (data: { driverId: string; latitude: number; longitude: number; timestamp: string }) => {
        const update = this.buildTrackingUpdate(data);
        if (update) {
          this._currentTracking.set(this._orderId!, update);
          this.listeners.forEach((cb) => cb(update));
        }
      });

      this.socket.on('order:status', (data: { status: string; orderId: string }) => {
        if (data.orderId === this._orderId) {
          const existing = this._currentTracking.get(data.orderId);
          const trackingStatus = SOCKET_STATUS_MAP[data.status] || data.status;
          if (existing) {
            const updated: TrackingUpdate = {
              ...existing,
              status: trackingStatus as OrderTrackingStatus,
              timestamp: new Date().toISOString(),
            };
            this._currentTracking.set(data.orderId, updated);
            this.listeners.forEach((cb) => cb(updated));
          }
        }
      });

      this.socket.on('connect_error', () => {
        this.startSimulation().catch(() => {});
      });
    } catch {
      this.startSimulation().catch(() => {});
    }
  }

  private buildTrackingUpdate(data: { driverId: string; latitude: number; longitude: number; timestamp: string }): TrackingUpdate | null {
    if (!this._orderId) return null;

    const driverLocation: DriverLocation = {
      driverId: data.driverId,
      coordinate: { latitude: data.latitude, longitude: data.longitude },
      heading: 0,
      speed: 0,
      timestamp: data.timestamp,
    };

    const existing = this._currentTracking.get(this._orderId);
    const estimatedMinutes = existing?.estimatedMinutes
      ? Math.max(0, existing.estimatedMinutes - 1)
      : 15;

    return {
      orderId: this._orderId,
      status: existing?.status || 'restaurant_confirmed',
      estimatedMinutes,
      estimatedArrival: new Date(Date.now() + estimatedMinutes * 60000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      driverLocation,
      timestamp: data.timestamp,
    };
  }

  disconnect(): void {
    if (this.socket) {
      if (this._orderId) {
        this.socket.emit('leave:order', this._orderId);
      }
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.stopSimulation();
    this._isConnected = false;
    this._orderId = null;
  }

  private routeCoordinates: Coordinate[] = [];
  private routeProgress: number = 0;
  private simulationStatusIndex: number = 0;
  private simulationStartLat: number = 0;
  private simulationStartLng: number = 0;
  private simulationEndLat: number = 0;
  private simulationEndLng: number = 0;

  private async startSimulation(): Promise<void> {
    if (this.simulationTimer) return;

    this._isConnected = true;
    this.connectionListeners.forEach((cb) => cb(true));

    const driverStart: Coordinate = this._simOptions?.restaurantLocation || { latitude: -6.7824, longitude: 39.1983 };
    const customer: Coordinate = this._simOptions?.customerLocation || { latitude: -6.8024, longitude: 39.2183 };

    this.simulationStartLat = driverStart.latitude;
    this.simulationStartLng = driverStart.longitude;
    this.simulationEndLat = customer.latitude;
    this.simulationEndLng = customer.longitude;
    this.simulationStatusIndex = 0;
    this.routeProgress = 0;

    const routeResult = await mapService.fetchRoute(
      [driverStart.longitude, driverStart.latitude],
      [customer.longitude, customer.latitude],
    );

    if (routeResult && routeResult.coordinates.length > 0) {
      this.routeCoordinates = routeResult.coordinates.map(
        ([lng, lat]): Coordinate => ({ latitude: lat, longitude: lng }),
      );
    } else {
      this.routeCoordinates = [
        driverStart,
        { latitude: -6.7924, longitude: 39.2083 },
        customer,
      ];
    }

    this.simulationTimer = setInterval(() => {
      const orderId = this._orderId || 'o1';

      if (this.routeProgress < 1 && this.simulationStatusIndex >= 4) {
        this.routeProgress = Math.min(1, this.routeProgress + 0.025);
        const pos = this.interpolateAlongRoute(this.routeProgress);
        const driverPos: Coordinate = { latitude: pos.lat, longitude: pos.lng };

        const driverLocation: DriverLocation = {
          driverId: 'd1',
          coordinate: driverPos,
          heading: this.calculateHeading(this.routeProgress),
          speed: 20 + Math.random() * 15,
          timestamp: new Date().toISOString(),
        };

        if (this.simulationStatusIndex < STATUS_SEQUENCE.length - 1 && Math.random() < 0.015) {
          this.simulationStatusIndex++;
        }

        const remainingMinutes = Math.max(2, Math.round((1 - this.routeProgress) * 15));
        const estimatedArrivalTime = new Date(Date.now() + remainingMinutes * 60000);

        const update: TrackingUpdate = {
          orderId,
          status: STATUS_SEQUENCE[this.simulationStatusIndex],
          estimatedMinutes: remainingMinutes,
          estimatedArrival: estimatedArrivalTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          driverLocation,
          route: {
            distance: routeResult?.distance || 2500,
            duration: routeResult?.duration || 600,
            polyline: '',
            coordinates: this.routeCoordinates,
          },
          timestamp: new Date().toISOString(),
        };

        this._currentTracking.set(orderId, update);
        this.listeners.forEach((cb) => cb(update));
      } else if (this.simulationStatusIndex < 4) {
        if (Math.random() < 0.03) {
          this.simulationStatusIndex++;
        }

        const update: TrackingUpdate = {
          orderId,
          status: STATUS_SEQUENCE[this.simulationStatusIndex],
          estimatedMinutes: 15,
          estimatedArrival: new Date(Date.now() + 900000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          route: {
            distance: routeResult?.distance || 2500,
            duration: routeResult?.duration || 600,
            polyline: '',
            coordinates: this.routeCoordinates,
          },
          timestamp: new Date().toISOString(),
        };

        this._currentTracking.set(orderId, update);
        this.listeners.forEach((cb) => cb(update));
      }
    }, 3000);
  }

  private interpolateAlongRoute(progress: number): { lat: number; lng: number } {
    if (!this.routeCoordinates || this.routeCoordinates.length === 0) {
      return {
        lat: this.simulationStartLat + (this.simulationEndLat - this.simulationStartLat) * progress,
        lng: this.simulationStartLng + (this.simulationEndLng - this.simulationStartLng) * progress,
      };
    }

    const totalSegments = this.routeCoordinates.length - 1;
    const exactIndex = progress * totalSegments;
    const segIndex = Math.min(Math.floor(exactIndex), totalSegments - 1);
    const segProgress = exactIndex - segIndex;

    const from = this.routeCoordinates[segIndex];
    const to = this.routeCoordinates[segIndex + 1];

    return {
      lat: from.latitude + (to.latitude - from.latitude) * segProgress,
      lng: from.longitude + (to.longitude - from.longitude) * segProgress,
    };
  }

  private calculateHeading(progress: number): number {
    const pos = this.interpolateAlongRoute(Math.min(1, progress + 0.01));
    const current = this.interpolateAlongRoute(progress);
    const dlat = pos.lat - current.lat;
    const dlng = pos.lng - current.lng;
    const angle = (Math.atan2(dlng, dlat) * 180) / Math.PI;
    return (angle + 360) % 360;
  }

  private stopSimulation(): void {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  onTrackingUpdate(callback: TrackingCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  getTrackingForOrder(orderId: string): TrackingUpdate | undefined {
    return this._currentTracking.get(orderId);
  }

  async fetchRoute(origin: Coordinate, destination: Coordinate) {
    return mapService.fetchRoute(
      [origin.longitude, origin.latitude],
      [destination.longitude, destination.latitude],
    );
  }

  cleanup(): void {
    this.disconnect();
    this.listeners.clear();
    this.connectionListeners.clear();
    this._currentTracking.clear();
  }
}

export const trackingService = new TrackingService();
