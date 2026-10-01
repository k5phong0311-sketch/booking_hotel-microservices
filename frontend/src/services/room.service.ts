import api from './api';
import { Room } from '../types';

export const roomService = {
  getAll: async (): Promise<Room[]> => {
    const res = await api.get<Room[]>('/rooms');
    return res.data;
  },

  getOne: async (id: number): Promise<Room> => {
    const res = await api.get<Room>(`/rooms/${id}`);
    return res.data;
  },

  checkAvailability: async (id: number): Promise<{ available: boolean; pricePerNight: number }> => {
    const res = await api.get(`/rooms/${id}/availability`);
    return res.data;
  },
};
