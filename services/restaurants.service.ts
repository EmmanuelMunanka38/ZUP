import { Restaurant, MenuItem, Category } from '@/types';
import { mockRestaurants, mockMenuItems, mockCategories } from './mock-data';

export const restaurantsService = {
  async getAll(): Promise<Restaurant[]> {
    await new Promise((r) => setTimeout(r, 400));
    return mockRestaurants;
  },

  async getById(id: string): Promise<Restaurant> {
    await new Promise((r) => setTimeout(r, 300));
    const restaurant = mockRestaurants.find((r) => r.id === id);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant;
  },

  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockMenuItems.filter((m) => m.restaurantId === restaurantId);
  },

  async getCategories(): Promise<Category[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockCategories;
  },

  async getFeatured(): Promise<Restaurant[]> {
    await new Promise((r) => setTimeout(r, 300));
    return mockRestaurants.slice(0, 2);
  },
};
