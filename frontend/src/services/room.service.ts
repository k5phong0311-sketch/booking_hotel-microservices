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
  
  createRoom: async (roomData: Partial<Room>) => {
    const res = await api.post('/rooms', roomData);
    return res.data;
  },

  updateRoom: async (id: number, roomData: Partial<Room>) => {
    const res = await api.patch(`/rooms/${id}`, roomData);
    return res.data;
  },

  toggleAvailability: async (id: number) => {
    const res = await api.patch(`/rooms/${id}/toggle-availability`);
    return res.data;
  },

  deleteRoom: async (id: number) => {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },

  getByPriceRange: async (min: number, max: number): Promise<Room[]> => {
    const res = await api.get<Room[]>(`/rooms/price?min=${min}&max=${max}`);
    return res.data;
  }
};

