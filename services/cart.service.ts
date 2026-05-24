import { api } from './api';

export interface BackendCartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface BackendCart {
  id: string;
  userId: string;
  restaurantId: string | null;
  items: BackendCartItem[];
}

export const cartService = {
  async getCart(): Promise<BackendCart> {
    const { data } = await api.get('/cart');
    return data.data;
  },

  async addItem(restaurantId: string, menuItemId: string, quantity: number = 1): Promise<BackendCart> {
    const { data } = await api.post('/cart/add', { restaurantId, menuItemId, quantity });
    return data.data;
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await api.put(`/cart/items/${itemId}`, { quantity });
  },

  async removeItem(itemId: string): Promise<void> {
    await api.delete(`/cart/items/${itemId}`);
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },
};
