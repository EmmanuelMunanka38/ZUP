import { Coordinate, DriverLocation, OrderTrackingStatus, TrackingUpdate } from '@/types';
import { mapService } from './map.service';

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

class TrackingService {
  private socket: WebSocket | null = null;
  private listeners: Set<TrackingCallback> = new Set();
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private _isConnected = false;
  private _currentTracking: Map<string, TrackingUpdate> = new Map();
  private simulationTimer: ReturnType<typeof setInterval> | null = null;

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

  connect(url?: string): void {
    if (this._isConnected) return;

    if (url) {
      try {
        this.socket = new WebSocket(url);
        this.socket.onopen = () => {
          this._isConnected = true;
          this.connectionListeners.forEach((cb) => cb(true));
        };
        this.socket.onmessage = (event) => {
          try {
            const update: TrackingUpdate = JSON.parse(event.data);
            this._currentTracking.set(update.orderId, update);
            this.listeners.forEach((cb) => cb(update));
          } catch {}
        };
        this.socket.onclose = () => {
          this._isConnected = false;
          this.connectionListeners.forEach((cb) => cb(false));
          this.reconnect(url);
        };
        this.socket.onerror = () => {
          this._isConnected = false;
        };
      } catch {
        this.startSimulation();
      }
    } else {
      this.startSimulation();
    }
  }

  private reconnect(url: string): void {
    setTimeout(() => {
      this.connect(url);
    }, 5000);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.stopSimulation();
    this._isConnected = false;
  }

  private startSimulation(): void {
    this._isConnected = true;
    this.connectionListeners.forEach((cb) => cb(true));

    const darEsSalaam: Coordinate = { latitude: -6.7924, longitude: 39.2083 };
    const driverStart: Coordinate = { latitude: -6.7824, longitude: 39.1983 };
    const restaurant: Coordinate = { latitude: -6.7924, longitude: 39.2083 };
    const customer: Coordinate = { latitude: -6.8024, longitude: 39.2183 };
    const mid: Coordinate = { latitude: -6.7974, longitude: 39.2133 };

    let currentStatusIndex = 0;
    let simulatedDriverPos = { ...driverStart };
    let progress = 0;

    this.simulationTimer = setInterval(() => {
      const orderId = 'o1';

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

      const route = {
        distance: 2500 + Math.random() * 500,
        duration: 600 + Math.random() * 120,
        polyline: '',
        coordinates: [driverStart, mid, customer],
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
