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

  connect(orderId: string, url?: string): void {
    this._orderId = orderId;

    if (this.socket?.connected) {
      this.socket.emit('track:order', orderId);
      return;
    }

    const baseUrl = url || process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
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
        this.startSimulation();
      });
    } catch {
      this.startSimulation();
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

  private startSimulation(): void {
    if (this.simulationTimer) return;

    this._isConnected = true;
    this.connectionListeners.forEach((cb) => cb(true));

    const darEsSalaam: Coordinate = { latitude: -6.7924, longitude: 39.2083 };
    const driverStart: Coordinate = { latitude: -6.7824, longitude: 39.1983 };
    const customer: Coordinate = { latitude: -6.8024, longitude: 39.2183 };

    let currentStatusIndex = 0;
    let simulatedDriverPos = { ...driverStart };
    let progress = 0;

    this.simulationTimer = setInterval(() => {
      const orderId = this._orderId || 'o1';

      if (progress < 1 && currentStatusIndex >= 4) {
        progress = Math.min(1, progress + 0.02);
        simulatedDriverPos = {
          latitude: driverStart.latitude + (customer.latitude - driverStart.latitude) * progress,
          longitude: driverStart.longitude + (customer.longitude - driverStart.longitude) * progress,
        };
      }

      if (currentStatusIndex < STATUS_SEQUENCE.length - 1 && Math.random() < 0.02) {
        currentStatusIndex++;
      }

      const driverLocation: DriverLocation = {
        driverId: 'd1',
        coordinate: simulatedDriverPos,
        heading: 45,
        speed: 25 + Math.random() * 15,
        timestamp: new Date().toISOString(),
      };

      const route: DeliveryRoute = {
        distance: 2500 + Math.random() * 500,
        duration: 600 + Math.random() * 120,
        polyline: '',
        coordinates: [driverStart, { latitude: -6.7924, longitude: 39.2083 }, customer],
      };

      const update: TrackingUpdate = {
        orderId,
        status: STATUS_SEQUENCE[currentStatusIndex],
        estimatedMinutes: Math.max(2, 15 - Math.floor(progress * 13)),
        estimatedArrival: new Date(Date.now() + 900000).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        driverLocation,
        route,
        timestamp: new Date().toISOString(),
      };

      this._currentTracking.set(orderId, update);
      this.listeners.forEach((cb) => cb(update));
    }, 3000);
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
