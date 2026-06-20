import { io, Socket } from 'socket.io-client';
import { Coordinate, DriverLocation, TrackingUpdate, OrderTrackingStatus } from '@/types';
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
  restaurant_accepted: 'restaurant_confirmed',
  preparing: 'preparing_order',
  ready_for_pickup: 'restaurant_confirmed',
  driver_assigned: 'driver_assigned',
  picked_up: 'picked_up',
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
          const trackingStatus = SOCKET_STATUS_MAP[data.status] || data.status;
          const existing = this._currentTracking.get(data.orderId);
          const updated: TrackingUpdate = {
            orderId: data.orderId,
            status: trackingStatus as OrderTrackingStatus,
            estimatedMinutes: existing?.estimatedMinutes || 0,
            estimatedArrival: existing?.estimatedArrival || '',
            driverLocation: existing?.driverLocation,
            timestamp: new Date().toISOString(),
          };
          this._currentTracking.set(data.orderId, updated);
          this.listeners.forEach((cb) => cb(updated));
        }
      });

      this.socket.on('connect_error', (err) => {
        console.error('Tracking socket connect error:', err.message);
      });
    } catch (err) {
      console.error('Tracking socket setup error:', err);
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
    this._isConnected = false;
    this._orderId = null;
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
