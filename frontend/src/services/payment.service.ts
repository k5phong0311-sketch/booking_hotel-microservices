import api from './api';
import { Payment } from '../types';

export interface CreatePaymentPayload {
  bookingId: number;
  userId: number;
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER' | 'MOMO';
}

export interface PaymentResponse {
  payment: Payment;
  momoUrl?: string;
}

export const paymentService = {
  create: async (payload: CreatePaymentPayload): Promise<PaymentResponse> => {
    const res = await api.post<PaymentResponse>('/payments', payload);
    return res.data;
  },

  getByBooking: async (bookingId: number): Promise<Payment> => {
    const res = await api.get<Payment>(`/payments/booking/${bookingId}`);
    return res.data;
  }
};
