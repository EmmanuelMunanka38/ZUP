import { create } from 'zustand';
import { CartItem, MenuItem } from '@/types';
import { cartService, BackendCartItem } from '@/services/cart.service';

function backendItemToCartItem(b: BackendCartItem): CartItem {
  return {
    id: b.id,
    menuItem: {
      id: b.menuItemId,
      name: b.name,
      price: b.price,
      restaurantId: '',
      description: '',
      image: '',
      category: '',
      isAvailable: true,
    },
    quantity: b.quantity,
  };
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  isSyncing: boolean;
  deliveryFee: number;
  serviceFee: number;

  addItem: (item: MenuItem, quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQty: (id: string, quantity: number) => Promise<void>;
  setRestaurantName: (name: string) => void;
  setDeliveryFee: (fee: number) => void;
  setServiceFee: (fee: number) => void;
  loadCart: () => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurantId: null,
  restaurantName: null,
  items: [],
  isSyncing: false,
  deliveryFee: 0,
  serviceFee: 0,

  addItem: async (menuItem, quantity = 1) => {
    const state = get();
    const existing = state.items.find((i) => i.menuItem.id === menuItem.id);

    if (existing) {
      const newQty = existing.quantity + quantity;
      set({
        items: state.items.map((i) =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: newQty } : i,
        ),
      });
      cartService.updateItemQuantity(existing.id, newQty).catch(() => {});
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newItem: CartItem = { id: tempId, menuItem, quantity };
    set({
      items: [...state.items, newItem],
      restaurantId: menuItem.restaurantId,
    });

    try {
      const cart = await cartService.addItem(menuItem.restaurantId, menuItem.id, quantity);
      const syncedItem = cart.items.find((b) => b.menuItemId === menuItem.id);
      set({
        items: get().items.map((i) =>
          i.id === tempId && syncedItem ? { ...i, id: syncedItem.id } : i,
        ),
        restaurantId: cart.restaurantId,
      });
    } catch {
      // keep local state even if backend sync fails
    }
  },

  setRestaurantName: (name) => set({ restaurantName: name }),
  setDeliveryFee: (fee) => set({ deliveryFee: fee }),
  setServiceFee: (fee) => set({ serviceFee: fee }),

  removeItem: async (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
    if (!id.startsWith('temp-')) {
      cartService.removeItem(id).catch(() => {});
    }
  },

  updateQty: async (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }));
    if (!id.startsWith('temp-')) {
      cartService.updateItemQuantity(id, quantity).catch(() => {});
    }
  },

  clearCart: async () => {
    set({ restaurantId: null, restaurantName: null, items: [], deliveryFee: 0, serviceFee: 0 });
    cartService.clearCart().catch(() => {});
  },

  loadCart: async () => {
    try {
      const cart = await cartService.getCart();
      set({
        items: cart.items.map(backendItemToCartItem),
        restaurantId: cart.restaurantId,
      });
    } catch {
      // no cart on backend yet — that's fine
    }
  },

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
}));
