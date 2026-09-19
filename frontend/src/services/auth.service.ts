import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  register: async (email: string, password: string, fullName: string, phone?: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { email, password, fullName, phone });
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
};
