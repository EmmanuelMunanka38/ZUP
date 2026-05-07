import { create } from 'zustand';
import { Order, TrackedOrder } from '@/types';
import { ordersService } from '@/services/orders.service';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  trackedOrder: TrackedOrder | null;
  isLoading: boolean;

  loadOrders: () => Promise<void>;
  loadCurrentOrder: (id: string) => Promise<void>;
  loadTrackedOrder: (id: string) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
  clearTrackedOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  trackedOrder: null,
  isLoading: false,

  loadOrders: async () => {
    set({ isLoading: true });
    try {
      const orders = await ordersService.getHistory();
      set({ orders, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadCurrentOrder: async (id) => {
    set({ isLoading: true });
    try {
      const order = await ordersService.getById(id);
      set({ currentOrder: order, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadTrackedOrder: async (id) => {
    try {
      const tracked = await ordersService.trackOrder(id);
      set({ trackedOrder: tracked });
    } catch {}
  },

  setCurrentOrder: (order) => set({ currentOrder: order }),

  clearTrackedOrder: () => set({ trackedOrder: null }),
}));
