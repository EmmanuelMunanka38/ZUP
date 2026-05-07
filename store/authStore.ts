import { create } from 'zustand';
import { User } from '@/types';
import { setStoredToken, clearStoredToken } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (phone: string) => Promise<{ requiresOTP: boolean }>;
  verifyOTP: (code: string) => Promise<void>;
  logout: () => void;
  hydrate: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    setStoredToken(token);
    set({ token });
  },

  login: async (phone: string) => {
    set({ isLoading: true });
    try {
      const { authService } = await import('@/services/auth.service');
      const response = await authService.login(phone);
      set({ isLoading: false });
      return response;
    } catch {
      set({ isLoading: false });
      throw new Error('Login failed');
    }
  },

  verifyOTP: async (code: string) => {
    set({ isLoading: true });
    try {
      const { authService } = await import('@/services/auth.service');
      const { user, token } = await authService.verifyOTP(code);
      setStoredToken(token);
      set({ user, token, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('Verification failed');
    }
  },

  logout: () => {
    clearStoredToken();
    set({ user: null, token: null });
  },

  hydrate: (user, token) => {
    setStoredToken(token);
    set({ user, token, isLoading: false });
  },
}));
