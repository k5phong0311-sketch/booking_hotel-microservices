import api from './api';
import { User } from '../types';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  updateRole: async (id: number, role: string): Promise<User> => {
    const response = await api.patch(`/users/${id}`, { role });
    return response.data;
  }
};
