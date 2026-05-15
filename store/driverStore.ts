import { create } from 'zustand';
import { DeliveryRequest, Rider } from '@/types';
import { driverService } from '@/services/driver.service';
import { mockRider } from '@/services/mock-data';

interface DriverState {
  isOnline: boolean;
  earnings: number;
  totalDeliveries: number;
  rider: Rider | null;
  requests: DeliveryRequest[];
  activeDelivery: DeliveryRequest | null;
  isLoading: boolean;

  toggleOnline: () => void;
  fetchRequests: () => Promise<void>;
  acceptDelivery: (id: string) => Promise<void>;
  ignoreDelivery: (id: string) => void;
  completeDelivery: () => Promise<void>;
  setRider: (rider: Rider) => void;
  fetchActiveDelivery: () => Promise<void>;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  isOnline: true,
  earnings: 42500,
  totalDeliveries: 14,
  rider: mockRider,
  requests: [],
  activeDelivery: null,
  isLoading: false,

  toggleOnline: () => set((s) => ({ isOnline: !s.isOnline })),

  fetchRequests: async () => {
    set({ isLoading: true });
    try {
      const requests = await driverService.getRequests();
      set({ requests, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  acceptDelivery: async (id) => {
    try {
      const request = await driverService.acceptRequest(id);
      set({
        activeDelivery: request,
        requests: get().requests.filter((r) => r.id !== id),
      });
    } catch {}
  },

  ignoreDelivery: (id) => {
    set({ requests: get().requests.filter((r) => r.id !== id) });
  },

  completeDelivery: async () => {
    const delivery = get().activeDelivery;
    if (!delivery) return;

    try {
      await driverService.updateOrderStatus(delivery.orderId, 'delivered');
      set({
        activeDelivery: null,
        earnings: get().earnings + delivery.deliveryFee,
        totalDeliveries: get().totalDeliveries + 1,
      });
    } catch {}
  },

  setRider: (rider) => set({ rider }),

  fetchActiveDelivery: async () => {
    try {
      const active = await driverService.getActive();
      set({ activeDelivery: active });
    } catch {}
  },
}));
