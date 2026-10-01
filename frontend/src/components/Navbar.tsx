import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <span className="font-serif font-bold text-2xl text-brand-dark tracking-wide">BOOKINGHOTEL.</span>
        </Link>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-brand-DEFAULT transition-colors uppercase tracking-wider">Khám Phá</Link>
          <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-brand-DEFAULT transition-colors uppercase tracking-wider">Về Chúng Tôi</Link>
          
          <div className="w-px h-6 bg-gray-200"></div>

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link to="/my-bookings" className="text-sm font-medium text-gray-600 hover:text-brand-DEFAULT transition-colors">Lịch sử đặt phòng</Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-bold">
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
              <Link to="/register" className="text-sm font-semibold bg-brand-dark text-white px-5 py-2.5 rounded hover:bg-brand-DEFAULT transition-colors tracking-wide">ĐĂNG KÝ</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
