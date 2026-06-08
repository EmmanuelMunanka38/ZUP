import { api } from './api';
import { DeliveryRequest, ApiResponse, Coordinate } from '@/types';

interface DriverDashboardData {
  todayOrders: number;
  dailyRevenue: number;
  orderGrowth: number;
  revenueGrowth: number;
  totalOrders: number;
  totalRevenue: number;
}

export const driverService = {
  async getRequests(): Promise<DeliveryRequest[]> {
    const { data } = await api.get<ApiResponse<DeliveryRequest[]>>('/driver/requests');
    return data.data;
  },

  async acceptRequest(id: string): Promise<DeliveryRequest> {
    const { data } = await api.post<ApiResponse<DeliveryRequest>>(`/driver/requests/${id}/accept`);
    return data.data;
  },

  async getActive(): Promise<DeliveryRequest | null> {
    const { data } = await api.get<ApiResponse<DeliveryRequest | null>>('/driver/active');
    return data.data;
  },

  async getDashboard(): Promise<DriverDashboardData> {
    const { data } = await api.get<ApiResponse<DriverDashboardData>>('/driver/dashboard');
    return data.data;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await api.put(`/orders/${orderId}/status`, { status });
  },

  async sendLocation(location: Coordinate): Promise<void> {
    try {
      await api.post('/driver/location', location);
    } catch {}
  },
};
