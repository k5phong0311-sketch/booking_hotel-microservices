import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './index.css'; // Tailwind CSS

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomDetailPage from './pages/RoomDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import ChatWidget from './components/ChatWidget';
import AdminDashboardPage from './pages/AdminDashboardPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <ChatWidget />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />

          {/* Protected routes — cần đăng nhập */}
          <Route path="/booking/:roomId" element={
            <PrivateRoute><BookingPage /></PrivateRoute>
          } />
          <Route path="/my-bookings" element={
            <PrivateRoute><MyBookingsPage /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><ProfilePage /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute><AdminDashboardPage /></PrivateRoute>
          } />
          <Route path="/payment/callback" element={
            <PaymentCallbackPage />
          } />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: 80 }}>
              <h2>404 - Trang không tìm thấy</h2>
              <a href="/" style={{ color: '#e94560' }}>← Về trang chủ</a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
