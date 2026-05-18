import { api } from './api';
import { Restaurant, MenuItem, Category, ApiResponse } from '@/types';

export const restaurantsService = {
  async getAll(): Promise<Restaurant[]> {
    const { data } = await api.get<ApiResponse<Restaurant[]>>('/restaurants');
    return data.data;
  },

  async getById(id: string): Promise<Restaurant> {
    const { data } = await api.get<ApiResponse<any>>(`/restaurants/${id}`);
    return data.data;
  },

  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    const { data } = await api.get<ApiResponse<MenuItem[]>>(`/restaurants/${restaurantId}/menu`);
    return data.data;
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<ApiResponse<Category[]>>('/categories');
    return data.data;
  },

  async getFeatured(): Promise<Restaurant[]> {
    const { data } = await api.get<ApiResponse<Restaurant[]>>('/restaurants/featured');
    return data.data;
  },

  async createMenuItem(restaurantId: string, item: Partial<MenuItem>): Promise<MenuItem> {
    const { data } = await api.post<ApiResponse<MenuItem>>(`/restaurants/${restaurantId}/menu`, item);
    return data.data;
  },

  async updateMenuItem(menuId: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data } = await api.put<ApiResponse<MenuItem>>(`/restaurants/menu/${menuId}`, updates);
    return data.data;
  },

  async deleteMenuItem(menuId: string): Promise<void> {
    await api.delete(`/restaurants/menu/${menuId}`);
  },
};
