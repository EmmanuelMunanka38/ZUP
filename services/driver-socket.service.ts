import { io, Socket } from 'socket.io-client';
import { DeliveryRequest, Coordinate } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

type NewRequestCallback = (request: DeliveryRequest) => void;
type ConnectionCallback = (connected: boolean) => void;
type StatusUpdateCallback = (data: { orderId: string; status: string }) => void;

class DriverSocketService {
  private socket: Socket | null = null;
  private newRequestListeners: Set<NewRequestCallback> = new Set();
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private statusListeners: Set<StatusUpdateCallback> = new Set();
  private _isConnected = false;
  private locationInterval: ReturnType<typeof setInterval> | null = null;
  private _isOnline = false;

  get isConnected(): boolean {
    return this._isConnected;
  }

  get isOnline(): boolean {
    return this._isOnline;
  }

  connect(url?: string): void {
    if (this.socket?.connected) return;

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
        if (this._isOnline) {
          this.startLocationPublishing();
        }
      });

      this.socket.on('disconnect', () => {
        this._isConnected = false;
        this.connectionListeners.forEach((cb) => cb(false));
        this.stopLocationPublishing();
      });

      this.socket.on('driver:new_request', (data: DeliveryRequest) => {
        this.newRequestListeners.forEach((cb) => cb(data));
      });

      this.socket.on('order:status', (data: { status: string; orderId: string }) => {
        this.statusListeners.forEach((cb) => cb(data));
      });
    } catch (err) {
      console.error('Driver socket connect error:', err);
    }
  }

  setOnline(isOnline: boolean): void {
    this._isOnline = isOnline;
    if (this.socket?.connected) {
      this.socket.emit('driver:online', { isOnline });
    }
    if (isOnline) {
      this.startLocationPublishing();
    } else {
      this.stopLocationPublishing();
    }
  }

  private startLocationPublishing(): void {
    if (this.locationInterval) return;
    this.locationInterval = setInterval(() => {
      const location = useLocationStore.getState().currentLocation;
      if (location && this.socket?.connected) {
        this.socket.emit('driver:location', {
          latitude: location.latitude,
          longitude: location.longitude,
          heading: 0,
          speed: 0,
          timestamp: new Date().toISOString(),
        });
      }
    }, 3000);
  }

  private stopLocationPublishing(): void {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = null;
    }
  }

  sendLocation(location: Coordinate): void {
    if (this.socket?.connected && this._isOnline) {
      this.socket.emit('driver:location', {
        latitude: location.latitude,
        longitude: location.longitude,
        heading: 0,
        speed: 0,
        timestamp: new Date().toISOString(),
      });
    }
  }

  disconnect(): void {
    this.stopLocationPublishing();
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this._isConnected = false;
  }

  onNewRequest(callback: NewRequestCallback): () => void {
    this.newRequestListeners.add(callback);
    return () => this.newRequestListeners.delete(callback);
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  onStatusUpdate(callback: StatusUpdateCallback): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  cleanup(): void {
    this.disconnect();
    this.newRequestListeners.clear();
    this.connectionListeners.clear();
    this.statusListeners.clear();
  }
}

export const driverSocketService = new DriverSocketService();
