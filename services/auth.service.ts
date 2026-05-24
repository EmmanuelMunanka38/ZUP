import { api } from './api';

export const authService = {
  async sendOtp(email: string, phone: string): Promise<void> {
    await api.post('/auth/send-otp', { email, phone });
  },

  async verifyOTP(
    email: string,
    code: string,
    name?: string,
  ): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const body: any = { email, code };
    if (name) body.name = name;
    const { data } = await api.post('/auth/verify-otp', body);
    return {
      user: data.data.user,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
  },

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { data } = await api.post('/auth/refresh', { refreshToken: token });
    return data.data;
  },

  async getProfile(): Promise<any> {
    const { data } = await api.get('/auth/profile');
    return data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // non-critical — clear local state regardless
    }
  },
};
