import { create } from 'zustand';
import { DeliveryRequest, Rider } from '@/types';
import { mockDeliveryRequests, mockRider } from '@/services/mock-data';

interface DriverState {
  isOnline: boolean;
  earnings: number;
  totalDeliveries: number;
  rider: Rider | null;
  requests: DeliveryRequest[];
  activeDelivery: DeliveryRequest | null;

  toggleOnline: () => void;
  fetchRequests: () => Promise<void>;
  acceptDelivery: (id: string) => void;
  ignoreDelivery: (id: string) => void;
  completeDelivery: () => void;
  setRider: (rider: Rider) => void;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  isOnline: true,
  earnings: 42500,
  totalDeliveries: 14,
  rider: mockRider,
  requests: [],
  activeDelivery: null,

  toggleOnline: () => set((s) => ({ isOnline: !s.isOnline })),

  fetchRequests: async () => {
    await new Promise((r) => setTimeout(r, 500));
    set({ requests: mockDeliveryRequests });
  },

  acceptDelivery: (id) => {
    const request = get().requests.find((r) => r.id === id);
    if (request) {
      set({ activeDelivery: request, requests: get().requests.filter((r) => r.id !== id) });
    }
  },

  ignoreDelivery: (id) => {
    set({ requests: get().requests.filter((r) => r.id !== id) });
  },

  completeDelivery: () => {
    const delivery = get().activeDelivery;
    if (delivery) {
      set({
        activeDelivery: null,
        earnings: get().earnings + delivery.deliveryFee,
        totalDeliveries: get().totalDeliveries + 1,
      });
    }
  },

  setRider: (rider) => set({ rider }),
}));
