// ===== User =====
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ===== Room =====
export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE';

export interface Room {
  id: number;
  name: string;
  type: RoomType;
  pricePerNight: number;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  floor: number;
  createdAt: string;
}

// ===== Booking =====
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'FAILED';

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingPayload {
  userId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
}

// ===== API Response =====
export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
}
