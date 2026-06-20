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
  error: string | null;

  loadRestaurants: () => Promise<void>;
  loadMyRestaurant: (ownerId: string) => Promise<void>;
  createRestaurant: (data: Partial<Restaurant>) => Promise<Restaurant>;
  loadFeatured: () => Promise<void>;
  loadCurrentRestaurant: (id: string) => Promise<void>;
  loadMenu: (restaurantId: string) => Promise<void>;
  loadAllMenus: () => Promise<void>;
  loadCategories: () => Promise<void>;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => Promise<void>;
  addMenuItem: (restaurantId: string, item: Partial<MenuItem>) => Promise<MenuItem>;
  updateMenuItem: (menuId: string, updates: Partial<MenuItem>) => Promise<void>;
  removeMenuItem: (menuId: string) => Promise<void>;
  clearError: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurants: [],
  featured: [],
  currentRestaurant: null,
  currentMenu: [],
  categories: [],
  dashboardStats: null,
  isLoading: false,
  error: null,

  loadRestaurants: async () => {
    set({ isLoading: true, error: null });
    try {
      const restaurants = await restaurantsService.getAll();
      set({ restaurants, isLoading: false });
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      set({ isLoading: false, error: 'Failed to load restaurants. Please check your connection and try again.' });
    }
  },

  loadMyRestaurant: async (ownerId: string) => {
    set({ error: null });
    try {
      const restaurants = await restaurantsService.getByOwner(ownerId);
      set({ restaurants });
    } catch (error) {
      console.error('Failed to load my restaurant:', error);
      set({ error: 'Failed to load your restaurant.' });
    }
  },

  loadFeatured: async () => {
    set({ error: null });
    try {
      const featured = await restaurantsService.getFeatured();
      set({ featured });
    } catch (error) {
      console.error('Failed to load featured:', error);
      set({ error: 'Failed to load featured restaurants.' });
    }
  },

  loadCurrentRestaurant: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const restaurant = await restaurantsService.getById(id);
      set({ currentRestaurant: restaurant, isLoading: false });
    } catch (error) {
      console.error('Failed to load restaurant:', error);
      set({ isLoading: false, error: 'Failed to load restaurant details.' });
    }
  },

  loadMenu: async (restaurantId) => {
    set({ isLoading: true, error: null });
    try {
      const menu = await restaurantsService.getMenu(restaurantId, true);
      set((state) => ({
        currentMenu: menu,
        restaurants: state.restaurants.map((r) =>
          r.id === restaurantId && !r.menu?.length ? { ...r, menu } : r
        ),
        featured: state.featured.map((r) =>
          r.id === restaurantId && !r.menu?.length ? { ...r, menu } : r
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load menu:', error);
      set({ isLoading: false, error: 'Failed to load menu.' });
    }
  },

  loadAllMenus: async () => {
    const { restaurants } = get();
    const ids = restaurants.filter((r) => !r.menu?.length).map((r) => r.id);
    if (ids.length === 0) return;
    const menuMap = new Map<string, MenuItem[]>();
    let idx = 0;
    const next = async () => {
      if (idx >= ids.length) return;
      const id = ids[idx++];
      try {
        const menu = await restaurantsService.getMenu(id, true);
        menuMap.set(id, menu);
      } catch (e) {
        console.warn(`Failed to load menu for ${id}:`, e);
      }
      await new Promise((r) => setTimeout(r, 300));
      await next();
    };
    await Promise.all(Array.from({ length: 2 }, next));
    if (menuMap.size === 0) return;
    set((state) => ({
      restaurants: state.restaurants.map((r) =>
        menuMap.has(r.id) && !r.menu?.length ? { ...r, menu: menuMap.get(r.id)! } : r
      ),
      featured: state.featured.map((r) =>
        menuMap.has(r.id) && !r.menu?.length ? { ...r, menu: menuMap.get(r.id)! } : r
      ),
    }));
  },

  loadCategories: async () => {
    set({ error: null });
    try {
      const categories = await restaurantsService.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  },

  setCurrentRestaurant: (restaurant) => set({ currentRestaurant: restaurant }),
  clearError: () => set({ error: null }),

  updateRestaurant: async (id: string, data: Partial<Restaurant>) => {
    try {
      const updated = await restaurantsService.update(id, data);
      set((state) => ({
        restaurants: state.restaurants.map((r) => (r.id === id ? { ...r, ...updated } : r)),
        currentRestaurant: state.currentRestaurant?.id === id ? { ...state.currentRestaurant, ...updated } : state.currentRestaurant,
      }));
    } catch (error) {
      console.error('Failed to update restaurant:', error);
      throw error;
    }
  },

  createRestaurant: async (data: Partial<Restaurant>): Promise<Restaurant> => {
    const restaurant = await restaurantsService.create(data);
    set((state) => ({ restaurants: [...state.restaurants, restaurant] }));
    return restaurant;
  },

  addMenuItem: async (restaurantId: string, item: Partial<MenuItem>) => {
    const newItem = await restaurantsService.createMenuItem(restaurantId, item);
    set((state) => ({
      currentMenu: [...state.currentMenu, newItem],
    }));
    return newItem;
  },

  updateMenuItem: async (menuId: string, updates: Partial<MenuItem>) => {
    const previous = get().currentMenu;
    set((state) => ({
      currentMenu: state.currentMenu.map((item) =>
        item.id === menuId ? { ...item, ...updates } : item
      ),
    }));
    try {
      const updated = await restaurantsService.updateMenuItem(menuId, updates);
      set((state) => ({
        currentMenu: state.currentMenu.map((item) =>
          item.id === menuId ? { ...item, ...updated } : item
        ),
      }));
    } catch (error) {
      set({ currentMenu: previous });
      console.error('Failed to update menu item:', error);
      throw error;
    }
  },

  removeMenuItem: async (menuId: string) => {
    const previous = get().currentMenu;
    set((state) => ({
      currentMenu: state.currentMenu.filter((item) => item.id !== menuId),
    }));
    try {
      await restaurantsService.deleteMenuItem(menuId);
    } catch (error) {
      set({ currentMenu: previous });
      console.error('Failed to delete menu item:', error);
      throw error;
    }
  },
}));
