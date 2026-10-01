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
import PaymentCallbackPage from './pages/PaymentCallbackPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background-color: #0b0c10;
            color: #e0e0e0;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Montserrat', sans-serif;
            color: #c5a059;
          }
          a { text-decoration: none; }
          @keyframes spin { to { transform: rotate(360deg); } }
          
          /* Tùy chỉnh thanh cuộn cho hợp tông dark */
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #0b0c10; }
          ::-webkit-scrollbar-thumb { background: #c5a059; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #a88540; }
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
          <Route path="/payment/callback" element={
            <PaymentCallbackPage />
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
