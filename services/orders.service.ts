import { api } from './api';
import { Order, TrackedOrder, CartItem, PaymentMethod, Address, ApiResponse } from '@/types';

interface PlaceOrderParams {
  restaurantId: string;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  deliveryAddress: Address;
  specialInstructions?: string;
}

export const ordersService = {
  async placeOrder(params: PlaceOrderParams): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>('/orders', {
      restaurantId: params.restaurantId,
      items: params.items.map((i) => ({
        menuItemId: i.menuItem.id,
        quantity: i.quantity,
        specialInstructions: i.specialInstructions,
      })),
      paymentMethod: params.paymentMethod,
      deliveryAddress: params.deliveryAddress,
      specialInstructions: params.specialInstructions,
    });
    return data.data;
  },

  async getHistory(): Promise<Order[]> {
    const { data } = await api.get<ApiResponse<Order[]>>('/orders');
    return data.data;
  },

  async getById(id: string): Promise<Order> {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data;
  },

  async trackOrder(id: string): Promise<TrackedOrder> {
    const { data } = await api.get<ApiResponse<TrackedOrder>>(`/orders/${id}/track`);
    return data.data;
  },

  async cancelOrder(id: string): Promise<void> {
    await api.post(`/orders/${id}/cancel`);
  },

  async reorder(orderId: string): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>(`/orders/${orderId}/reorder`);
    return data.data;
  },
};
