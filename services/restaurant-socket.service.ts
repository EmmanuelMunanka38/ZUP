import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

type OrderNotificationCallback = (data: { orderId: string; status: string; orderNumber?: string }) => void;
type ConnectionCallback = (connected: boolean) => void;

class RestaurantSocketService {
  private socket: Socket | null = null;
  private orderListeners: Set<OrderNotificationCallback> = new Set();
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private _isConnected = false;

  get isConnected(): boolean {
    return this._isConnected;
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
      });

      this.socket.on('disconnect', () => {
        this._isConnected = false;
        this.connectionListeners.forEach((cb) => cb(false));
      });

      this.socket.on('order:status', (data: { status: string; orderId: string }) => {
        this.orderListeners.forEach((cb) => cb(data));
      });

      this.socket.on('order:new', (data: { orderId: string; orderNumber: string }) => {
        this.orderListeners.forEach((cb) => cb({ ...data, status: 'pending' }));
      });
    } catch (err) {
      console.error('Restaurant socket connect error:', err);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this._isConnected = false;
  }

  onOrderNotification(callback: OrderNotificationCallback): () => void {
    this.orderListeners.add(callback);
    return () => this.orderListeners.delete(callback);
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  cleanup(): void {
    this.disconnect();
    this.orderListeners.clear();
    this.connectionListeners.clear();
  }
}

export const restaurantSocketService = new RestaurantSocketService();
