import { Restaurant, MenuItem, Category, Order, CartItem, Rider, User, TrackedOrder, DashboardStats, DeliveryRequest } from '@/types';
import { Images } from '@/constants/images';

export const mockUsers: User[] = [
  { id: 'u1', phone: '+255712345678', name: 'Jabari Mwangi', email: 'jabari.m@piki.food', role: 'customer', createdAt: '2024-01-15' },
  { id: 'u2', phone: '+255712345679', name: 'Mama Africa Cuisine', role: 'restaurant_owner', createdAt: '2023-11-01' },
  { id: 'u3', phone: '+255712345680', name: 'Juma Bakari', role: 'driver', createdAt: '2024-02-20' },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Pizza', icon: 'pizza', image: '' },
  { id: '2', name: 'Burgers', icon: 'food', image: '' },
  { id: '3', name: 'Swahili', icon: 'silverware', image: '' },
  { id: '4', name: 'Drinks', icon: 'glass-cocktail', image: '' },
  { id: '5', name: 'Pastry', icon: 'food-croissant', image: '' },
  { id: '6', name: 'Fruits', icon: 'fruit-watermelon', image: '' },
];

export const mockMenuItems: MenuItem[] = [
  { id: 'm1', restaurantId: 'r1', name: 'Beef Samosas (3pcs)', description: 'Crispy beef samosas with herbs', price: 7500, image: Images.restaurantDetails.menuItems[0], category: 'Appetizers', isAvailable: true },
  { id: 'm2', restaurantId: 'r1', name: 'Beef Pilau', description: 'Spiced rice with tender beef', price: 12500, image: Images.restaurantDetails.menuItems[1], category: 'Mains', isAvailable: true },
  { id: 'm3', restaurantId: 'r1', name: 'Cheese Garlic Bread', description: 'Toasted with mozzarella', price: 6500, image: Images.restaurantDetails.menuItems[2], category: 'Appetizers', isAvailable: true },
  { id: 'm4', restaurantId: 'r1', name: 'Grilled Tilapia', description: 'Whole tilapia with ugali', price: 15000, image: Images.restaurantDetails.menuItems[3], category: 'Mains', isAvailable: true },
  { id: 'm5', restaurantId: 'r1', name: 'Fresh Passion Juice', description: 'Freshly squeezed', price: 4000, image: Images.restaurantDetails.menuItems[4], category: 'Drinks', isAvailable: true },
  { id: 'm6', restaurantId: 'r1', name: 'Swahili Pilau Mix', description: 'Mixed pilau with beef & chicken', price: 10000, image: Images.restaurantDetails.menuItems[5], category: 'Popular', isAvailable: true },
  { id: 'm7', restaurantId: 'r2', name: 'Classic Burger', description: 'Beef patty with lettuce and tomato', price: 15000, image: '', category: 'Mains', isAvailable: true },
  { id: 'm8', restaurantId: 'r2', name: 'French Fries', description: 'Crispy golden fries', price: 5000, image: '', category: 'Sides', isAvailable: true },
  { id: 'm9', restaurantId: 'r3', name: 'Traditional Pilau', description: 'Aromatic rice with spices', price: 12000, image: '', category: 'Mains', isAvailable: true },
  { id: 'm10', restaurantId: 'r3', name: 'Mishkaki', description: 'Grilled beef skewers', price: 10000, image: '', category: 'Appetizers', isAvailable: true },
];

export const mockRestaurants: Restaurant[] = [
  {
    id: 'r1', name: "Chui's Italian Kitchen", image: Images.home.restaurants[0].image,
    cuisine: 'Italian', rating: 4.8, ratingCount: 120, deliveryFee: 2500, deliveryTime: '25-35 min',
    distance: '1.2 km', address: 'Masaki', isOpen: true, openingHours: '10:00 AM', closingHours: '10:00 PM',
    categories: ['Pizza', 'Pasta'], menu: [mockMenuItems[0], mockMenuItems[1], mockMenuItems[2], mockMenuItems[3], mockMenuItems[4], mockMenuItems[5]],
  },
  {
    id: 'r2', name: 'Street Burgers Arusha', image: Images.home.restaurants[1].image,
    cuisine: 'American', rating: 4.5, ratingCount: 89, deliveryFee: 2000, deliveryTime: '20-30 min',
    distance: '0.8 km', address: 'Arusha', isOpen: true, openingHours: '11:00 AM', closingHours: '11:00 PM',
    categories: ['Burgers', 'Fries'], menu: [mockMenuItems[6], mockMenuItems[7]],
  },
  {
    id: 'r3', name: "Mama Ntilie Gourmet", image: Images.home.restaurants[0].image,
    cuisine: 'Swahili', rating: 4.9, ratingCount: 234, deliveryFee: 1500, deliveryTime: '30-40 min',
    distance: '2.1 km', address: 'Msasani', isOpen: true, openingHours: '9:00 AM', closingHours: '9:00 PM',
    categories: ['Swahili', 'Seafood'], menu: [mockMenuItems[8], mockMenuItems[9]],
  },
];

export const mockRider: Rider = {
  id: 'd1', name: 'Juma Bakari', phone: '+255712345680',
  avatar: Images.trackOrder.rider, rating: 4.9,
  vehicle: 'Piki-Piki', plateNumber: 'TZ-384-A',
  location: { latitude: -6.7924, longitude: 39.2083 },
};

export const mockOrders: Order[] = [
  {
    id: 'o1', orderNumber: 'PIKI-8829',
    restaurant: mockRestaurants[0],
    items: [
      { id: 'ci1', menuItemId: 'm2', name: 'Beef Pilau', price: 12500, quantity: 2 },
      { id: 'ci2', menuItemId: 'm5', name: 'Fresh Passion Juice', price: 4000, quantity: 1 },
    ],
    subtotal: 29000, deliveryFee: 2500, serviceFee: 500, total: 32000,
    status: 'on_the_way', paymentMethod: 'mpesa',
    deliveryAddress: { id: 'a1', label: 'Home', street: 'Chole Road', area: 'Masaki', city: 'Dar es Salaam', isDefault: true },
    rider: mockRider,
    createdAt: '2024-10-24T12:30:00Z',
    estimatedDelivery: '2024-10-24T13:05:00Z',
  },
  {
    id: 'o2', orderNumber: 'PIKI-8815',
    restaurant: mockRestaurants[1],
    items: [{ id: 'ci3', menuItemId: 'm7', name: 'Classic Burger', price: 15000, quantity: 1 }],
    subtotal: 15000, deliveryFee: 2000, serviceFee: 500, total: 17500,
    status: 'cancelled', paymentMethod: 'card',
    deliveryAddress: { id: 'a1', label: 'Home', street: 'Chole Road', area: 'Masaki', city: 'Dar es Salaam', isDefault: true },
    createdAt: '2024-10-21T19:15:00Z',
  },
  {
    id: 'o3', orderNumber: 'PIKI-8790',
    restaurant: mockRestaurants[2],
    items: [
      { id: 'ci4', menuItemId: 'm9', name: 'Traditional Pilau', price: 12000, quantity: 1 },
      { id: 'ci5', menuItemId: 'm10', name: 'Mishkaki', price: 10000, quantity: 2 },
    ],
    subtotal: 32000, deliveryFee: 1500, serviceFee: 500, total: 34000,
    status: 'delivered', paymentMethod: 'mpesa',
    deliveryAddress: { id: 'a1', label: 'Home', street: 'Chole Road', area: 'Masaki', city: 'Dar es Salaam', isDefault: true },
    rider: mockRider,
    createdAt: '2024-10-18T13:45:00Z',
    actualDelivery: '2024-10-18T14:20:00Z',
  },
  {
    id: 'o4', orderNumber: 'PIKI-8755',
    restaurant: mockRestaurants[0],
    items: [
      { id: 'ci6', menuItemId: 'm1', name: 'Beef Samosas (3pcs)', price: 7500, quantity: 3 },
      { id: 'ci7', menuItemId: 'm4', name: 'Grilled Tilapia', price: 15000, quantity: 1 },
    ],
    subtotal: 37500, deliveryFee: 2500, serviceFee: 1000, total: 41000,
    status: 'delivered', paymentMethod: 'cash',
    deliveryAddress: { id: 'a1', label: 'Home', street: 'Chole Road', area: 'Masaki', city: 'Dar es Salaam', isDefault: true },
    createdAt: '2024-09-30T20:20:00Z',
    actualDelivery: '2024-09-30T21:00:00Z',
  },
];

export const mockTrackedOrder: TrackedOrder = {
  status: 'on_the_way',
  estimatedMinutes: 12,
  estimatedArrival: '14:45',
  rider: mockRider,
  steps: [
    { label: 'Ordered', completed: true, active: false },
    { label: 'Preparing', completed: true, active: false },
    { label: 'On the Way', completed: false, active: true },
    { label: 'Arrived', completed: false, active: false },
  ],
};

export const mockDashboardStats: DashboardStats = {
  todayOrders: 42,
  dailyRevenue: 840000,
  activeRiders: 6,
  orderGrowth: 12,
  revenueGrowth: 8,
};

export const mockDeliveryRequests: DeliveryRequest[] = [
  {
    id: 'dr1', orderId: 'o5',
    restaurant: { name: 'Mamboz BBQ', address: 'City Center', image: Images.driverDashboard.request },
    customer: { name: 'Sarah J.', address: 'Regency Apartments, Oysterbay' },
    pickup: 'Mamboz BBQ, City Center',
    dropoff: 'Regency Apartments, Oysterbay',
    distance: 1.2, deliveryFee: 3500,
    items: ['2x Swahili Pilau Mixed', '1x Fresh Juice'],
    timeLeft: 165,
  },
];

export const mockDrinks = [
  { name: 'Avocado Shake', price: 8000 },
  { name: 'Passion Mix', price: 5500 },
  { name: 'Iced Latte', price: 9500 },
  { name: 'Mango Smoothie', price: 6500 },
];

export function generateOrderNumber(): string {
  return `PIKI-${Math.floor(1000 + Math.random() * 9000)}`;
}
