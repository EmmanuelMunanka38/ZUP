import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import Constants from 'expo-constants';

const EXPO_API_URL = process.env.EXPO_PUBLIC_API_URL || (Constants.expoConfig?.extra?.apiUrl as string) || 'https://zupbackend-production.up.railway.app';
const BASE_URL = EXPO_API_URL;

// Debug: print where the app is reading the API URL from at runtime/build
console.log('🌐 EXPO_PUBLIC_API_URL (process.env):', process.env.EXPO_PUBLIC_API_URL);
console.log('📡 Expo extra.apiUrl (Constants):', Constants.expoConfig?.extra?.apiUrl);
console.log('📡 Axios is pointing to:', BASE_URL);


export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      router.replace('/onboarding');
    }
    return Promise.reject(error);
  }
);
