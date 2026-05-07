import { create } from 'zustand';
import { Restaurant, MenuItem, Category, DashboardStats } from '@/types';
import { restaurantsService } from '@/services/restaurants.service';

interface RestaurantState {
  restaurants: Restaurant[];
  featured: Restaurant[];
  currentRestaurant: Restaurant | null;
  currentMenu: MenuItem[];
  categories: Category[];
  dashboardStats: DashboardStats | null;
  isLoading: boolean;

  loadRestaurants: () => Promise<void>;
  loadFeatured: () => Promise<void>;
  loadCurrentRestaurant: (id: string) => Promise<void>;
  loadMenu: (restaurantId: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurants: [],
  featured: [],
  currentRestaurant: null,
  currentMenu: [],
  categories: [],
  dashboardStats: null,
  isLoading: false,

  loadRestaurants: async () => {
    set({ isLoading: true });
    try {
      const restaurants = await restaurantsService.getAll();
      set({ restaurants, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadFeatured: async () => {
    try {
      const featured = await restaurantsService.getFeatured();
      set({ featured });
    } catch {}
  },

  loadCurrentRestaurant: async (id) => {
    set({ isLoading: true });
    try {
      const restaurant = await restaurantsService.getById(id);
      set({ currentRestaurant: restaurant, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadMenu: async (restaurantId) => {
    try {
      const menu = await restaurantsService.getMenu(restaurantId);
      set({ currentMenu: menu });
    } catch {}
  },

  loadCategories: async () => {
    try {
      const categories = await restaurantsService.getCategories();
      set({ categories });
    } catch {}
  },

  setCurrentRestaurant: (restaurant) => set({ currentRestaurant: restaurant }),
}));
