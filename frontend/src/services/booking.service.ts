import api from './api';
import { Booking, CreateBookingPayload } from '../types';

export const bookingService = {
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const res = await api.post<Booking>('/bookings', payload);
    return res.data;
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const res = await api.get<Booking[]>('/bookings');
    return res.data;
  },

  getMyBookings: async (userId: number): Promise<Booking[]> => {
    const res = await api.get<Booking[]>(`/bookings/user/${userId}`);
    return res.data;
  },

  getOne: async (id: number): Promise<Booking> => {
    const res = await api.get<Booking>(`/bookings/${id}`);
    return res.data;
  },

  updateStatus: async (id: number, status: string): Promise<Booking> => {
    const res = await api.patch<Booking>(`/bookings/${id}/status`, { status });
    return res.data;
  },

  cancel: async (id: number): Promise<Booking> => {
    const res = await api.patch<Booking>(`/bookings/${id}/cancel`);
    return res.data;
  },
};
