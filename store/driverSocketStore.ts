import { create } from 'zustand';
import { DeliveryRequest } from '@/types';
import { driverSocketService } from '@/services/driver-socket.service';
import { useDriverStore } from './driverStore';

interface DriverSocketState {
  isConnected: boolean;
  requestQueue: DeliveryRequest[];

  connect: () => void;
  disconnect: () => void;
  setOnline: (online: boolean) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
}

export const useDriverSocketStore = create<DriverSocketState>((set, get) => ({
  isConnected: false,
  requestQueue: [],

  connect: () => {
    driverSocketService.onConnectionChange((connected) => {
      set({ isConnected: connected });
    });

    driverSocketService.onNewRequest((request) => {
      const queue = get().requestQueue;
      if (!queue.find((r) => r.id === request.id)) {
        set({ requestQueue: [...queue, request] });
      }
    });

    driverSocketService.onAssignedDelivery((delivery) => {
      useDriverStore.getState().setActiveDelivery(delivery);
    });

    driverSocketService.connect();
  },

  disconnect: () => {
    driverSocketService.disconnect();
    set({ isConnected: false, requestQueue: [] });
  },

  setOnline: (online) => {
    driverSocketService.setOnline(online);
  },

  removeFromQueue: (id) => {
    set({ requestQueue: get().requestQueue.filter((r) => r.id !== id) });
  },

  clearQueue: () => {
    set({ requestQueue: [] });
  },
}));
