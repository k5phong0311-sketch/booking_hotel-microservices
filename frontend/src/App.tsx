import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomDetailPage from './pages/RoomDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <style>{`
          * { box-sizing: border-box; }
          body { margin: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
          a { text-decoration: none; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
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

          {/* 404 */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: 80 }}>
              <h2>404 — Trang không tìm thấy</h2>
              <a href="/" style={{ color: '#e94560' }}>← Về trang chủ</a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
