import { create } from 'zustand';
import { CartItem, MenuItem } from '@/types';

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurantId: null,
  restaurantName: null,
  items: [],

  addItem: (menuItem, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === menuItem.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === menuItem.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
          restaurantId: menuItem.restaurantId,
          restaurantName: null,
        };
      }
      return {
        items: [
          ...state.items,
          { id: menuItem.id, menuItem, quantity },
        ],
        restaurantId: menuItem.restaurantId,
        restaurantName: null,
      };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  updateQty: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () => set({ restaurantId: null, restaurantName: null, items: [] }),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
}));
