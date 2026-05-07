import { Order, TrackedOrder, CartItem, PaymentMethod, Address } from '@/types';
import { mockOrders, mockTrackedOrder, generateOrderNumber } from './mock-data';
import { useCartStore } from '@/store/cartStore';

export const ordersService = {
  async placeOrder(params: {
    restaurantId: string;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    deliveryAddress: Address;
    specialInstructions?: string;
  }): Promise<Order> {
    await new Promise((r) => setTimeout(r, 1000));
    const subtotal = params.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
    const deliveryFee = 2500;
    const serviceFee = Math.round(subtotal * 0.03);
    const mockOrder: Order = {
      id: 'o-new-' + Date.now(),
      orderNumber: generateOrderNumber(),
      restaurant: { id: params.restaurantId, name: useCartStore.getState().restaurantName || 'Restaurant', image: '', cuisine: '', rating: 0, ratingCount: 0, deliveryFee, deliveryTime: '25-35 min', distance: '0', address: '', isOpen: true, categories: [], menu: [] },
      items: params.items,
      subtotal, deliveryFee, serviceFee,
      total: subtotal + deliveryFee + serviceFee,
      status: 'confirmed',
      paymentMethod: params.paymentMethod,
      deliveryAddress: params.deliveryAddress,
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 35 * 60000).toISOString(),
    };
    return mockOrder;
  },

  async getHistory(): Promise<Order[]> {
    await new Promise((r) => setTimeout(r, 500));
    return mockOrders;
  },

  async getById(id: string): Promise<Order> {
    await new Promise((r) => setTimeout(r, 300));
    const order = mockOrders.find((o) => o.id === id);
    if (order) return order;
    return mockOrders[0];
  },

  async trackOrder(id: string): Promise<TrackedOrder> {
    await new Promise((r) => setTimeout(r, 400));
    return mockTrackedOrder;
  },

  async cancelOrder(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
  },

  async reorder(orderId: string): Promise<Order> {
    await new Promise((r) => setTimeout(r, 600));
    const existing = mockOrders.find((o) => o.id === orderId);
    if (!existing) throw new Error('Order not found');
    return { ...existing, id: 'o-reorder-' + Date.now(), orderNumber: generateOrderNumber(), status: 'pending', createdAt: new Date().toISOString() };
  },
};
