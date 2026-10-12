import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNotifications = () => {
    if (!user?.id) return;
    api.get<NotificationItem[]>(`/notifications/user/${user.id}`)
      .then(res => setNotifications(res.data || []))
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user?.id]);

  const handleMarkRead = async (notif: NotificationItem) => {
    if (notif.isRead) return;
    try {
      await api.patch(`/notifications/${notif.id}/read`);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/90 backdrop-blur-md py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-dark rounded-sm flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg leading-none">B</span>
          </div>
          <span className="font-serif font-bold text-2xl text-brand-dark tracking-wide">BOOKINGHOTEL</span>
        </Link>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-brand-DEFAULT transition-colors uppercase tracking-wider">Khám phá</Link>
          <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-brand-DEFAULT transition-colors uppercase tracking-wider">Về chúng tôi</Link>
          
          <div className="w-px h-6 bg-gray-200"></div>

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-sm font-bold text-brand-dark hover:text-brand-DEFAULT transition-colors">Admin Dashboard</Link>
              )}
              <Link to="/my-bookings" className="text-sm font-medium text-gray-600 hover:text-brand-DEFAULT transition-colors">Lịch sử đặt phòng</Link>

              {/* Chuông thông báo */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showNotif;
                    setShowNotif(next);
                    if (next) fetchNotifications();
                  }}
                  className="relative p-2 text-gray-600 hover:text-brand-dark transition-colors"
                  title="Thông báo"
                >
                  <span className="text-lg">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-900">Thông báo ({notifications.length})</span>
                      <button onClick={() => setShowNotif(false)} className="text-xs text-gray-400 hover:text-gray-600">Đóng</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400">Chưa có thông báo nào.</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkRead(n)}
                            className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-xs font-bold text-gray-900">{n.title}</p>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1"></span>}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-medium">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-900">{user?.fullName}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-brand-DEFAULT transition-colors">Đăng nhập</Link>
              <Link to="/register" className="text-sm font-medium bg-brand-dark text-white px-5 py-2 rounded hover:bg-brand-DEFAULT transition-colors shadow-sm">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

