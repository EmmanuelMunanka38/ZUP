import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AsyncStorage } from '@/utils/storage';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  sendOtp: (email: string, phone: string) => Promise<void>;
  verifyOTP: (email: string, code: string, name?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      sendOtp: async (email: string, phone: string) => {
        set({ isLoading: true });
        try {
          const { authService } = await import('@/services/auth.service');
          await authService.sendOtp(email, phone);
          set({ isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          const message = err?.response?.data?.message
            || err?.response?.data?.errors?.[0]?.message
            || 'Failed to send OTP';
          throw new Error(message);
        }
      },

      verifyOTP: async (email: string, code: string, name?: string) => {
        set({ isLoading: true });
        try {
          const { authService } = await import('@/services/auth.service');
          const { user, token } = await authService.verifyOTP(email, code, name);
          set({ user, token, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          const message = err?.response?.data?.message
            || err?.response?.data?.errors?.[0]?.message
            || 'Verification failed';
          throw new Error(message);
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
