import { User } from '@/types';
import { mockUsers } from './mock-data';

export const authService = {
  async login(phone: string): Promise<{ requiresOTP: boolean }> {
    await new Promise((r) => setTimeout(r, 800));
    return { requiresOTP: true };
  },

  async verifyOTP(code: string): Promise<{ user: User; token: string }> {
    await new Promise((r) => setTimeout(r, 600));
    const user = mockUsers[0];
    return { user, token: 'mock-jwt-token-' + Date.now() };
  },

  async getProfile(): Promise<User> {
    await new Promise((r) => setTimeout(r, 300));
    return mockUsers[0];
  },
};
