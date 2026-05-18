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
  addMenuItem: (restaurantId: string, item: Partial<MenuItem>) => Promise<MenuItem>;
  updateMenuItem: (menuId: string, updates: Partial<MenuItem>) => Promise<void>;
  removeMenuItem: (menuId: string) => Promise<void>;
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

  addMenuItem: async (restaurantId: string, item: Partial<MenuItem>) => {
    const newItem = await restaurantsService.createMenuItem(restaurantId, item);
    set((state) => ({
      currentMenu: [...state.currentMenu, newItem],
    }));
    return newItem;
  },

  updateMenuItem: async (menuId: string, updates: Partial<MenuItem>) => {
    const updated = await restaurantsService.updateMenuItem(menuId, updates);
    set((state) => ({
      currentMenu: state.currentMenu.map((item) =>
        item.id === menuId ? { ...item, ...updated } : item
      ),
    }));
  },

  removeMenuItem: async (menuId: string) => {
    await restaurantsService.deleteMenuItem(menuId);
    set((state) => ({
      currentMenu: state.currentMenu.filter((item) => item.id !== menuId),
    }));
  },
}));
