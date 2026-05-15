import { create } from 'zustand';
import { TrackingUpdate, OrderTrackingStatus, DeliveryRoute, Coordinate } from '@/types';
import { trackingService } from '@/services/tracking.service';

interface TrackingState {
  isConnected: boolean;
  trackingUpdates: Map<string, TrackingUpdate>;
  currentOrderId: string | null;
  currentStatus: OrderTrackingStatus | null;
  estimatedMinutes: number;
  estimatedArrival: string;
  driverLocation: Coordinate | null;
  driverHeading: number;
  route: DeliveryRoute | null;

  connect: (orderId: string, wsUrl?: string) => void;
  disconnect: () => void;
  clearTracking: () => void;
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  isConnected: false,
  trackingUpdates: new Map(),
  currentOrderId: null,
  currentStatus: null,
  estimatedMinutes: 0,
  estimatedArrival: '',
  driverLocation: null,
  driverHeading: 0,
  route: null,

  connect: (orderId: string, wsUrl?: string) => {
    const existing = get().currentOrderId;
    if (existing) {
      trackingService.disconnect();
    }

    set({ currentOrderId: orderId });

    trackingService.onConnectionChange((connected) => {
      set({ isConnected: connected });
    });

    trackingService.onTrackingUpdate((update: TrackingUpdate) => {
      const updates = new Map(get().trackingUpdates);
      updates.set(update.orderId, update);

      const newState: Partial<TrackingState> = {
        trackingUpdates: updates,
        currentStatus: update.status,
        estimatedMinutes: update.estimatedMinutes,
        estimatedArrival: update.estimatedArrival,
      };

      if (update.driverLocation) {
        newState.driverLocation = update.driverLocation.coordinate;
        newState.driverHeading = update.driverLocation.heading;
      }

      if (update.route) {
        newState.route = update.route;
      }

      set(newState);
    });

    trackingService.connect(orderId, wsUrl);
  },

  disconnect: () => {
    trackingService.disconnect();
    set({
      isConnected: false,
      currentOrderId: null,
      currentStatus: null,
      driverLocation: null,
      route: null,
    });
  },

  clearTracking: () => {
    set({
      trackingUpdates: new Map(),
      currentOrderId: null,
      currentStatus: null,
      estimatedMinutes: 0,
      estimatedArrival: '',
      driverLocation: null,
      driverHeading: 0,
      route: null,
    });
  },
}));

export const getStatusLabel = (status: OrderTrackingStatus): string => {
  return trackingService.getStatusLabel(status);
};

export const getStatusSequence = (): OrderTrackingStatus[] => {
  return trackingService.statusSequence;
};

export const getStatusIndex = (status: OrderTrackingStatus): number => {
  return trackingService.getStatusIndex(status);
};
