import { api } from './api';

export const authService = {
  async sendOtp(email: string, phone: string): Promise<void> {
    await api.post('/auth/send-otp', { email, phone });
  },

  async verifyOTP(email: string, code: string, name?: string): Promise<{ user: any; token: string }> {
    const body: any = { email, code };
    if (name) body.name = name;
    const { data } = await api.post('/auth/verify-otp', body);
    return { user: data.data.user, token: data.data.accessToken };
  },

  async getProfile(): Promise<any> {
    const { data } = await api.get('/auth/profile');
    return data.data;
  },
};
