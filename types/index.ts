export interface User {
  id: string;
  phone: string;
  name: string;
  avatar?: string;
  email?: string;
  role: 'customer' | 'restaurant_owner' | 'driver';
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  logo?: string;
  cuisine: string;
  rating: number;
  ratingCount: number;
  deliveryFee: number;
  deliveryTime: string;
  distance: string;
  address: string;
  isOpen: boolean;
  categories: string[];
  menu: MenuItem[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurant: Restaurant;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: Address;
  rider?: Rider;
  createdAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'on_the_way'
  | 'arrived'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'mpesa'
  | 'tigo_pesa'
  | 'airtel_money'
  | 'card'
  | 'cash';

export interface Address {
  id: string;
  label: string;
  street: string;
  area: string;
  city: string;
  isDefault: boolean;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  vehicle: string;
  plateNumber: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface DashboardStats {
  todayOrders: number;
  dailyRevenue: number;
  activeRiders: number;
  orderGrowth: number;
  revenueGrowth: number;
}

export interface DeliveryRequest {
  id: string;
  orderId: string;
  restaurant: {
    name: string;
    address: string;
    image: string;
  };
  customer: {
    name: string;
    address: string;
  };
  pickup: string;
  dropoff: string;
  distance: number;
  deliveryFee: number;
  items: string[];
  timeLeft: number;
}

export interface TrackedOrder {
  status: OrderStatus;
  estimatedMinutes: number;
  estimatedArrival: string;
  rider?: Rider;
  steps: {
    label: string;
    completed: boolean;
    active: boolean;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
