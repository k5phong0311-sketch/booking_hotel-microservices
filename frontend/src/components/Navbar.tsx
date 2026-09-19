import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/" style={styles.brandLink}>🏨 BookingHotel</Link>
      </div>
      <div style={styles.menu}>
        <Link to="/" style={styles.link}>Danh sách phòng</Link>
        {isAuthenticated ? (
          <>
            <Link to="/my-bookings" style={styles.link}>Đơn đặt của tôi</Link>
            <Link to="/profile" style={styles.link}>👤 {user?.fullName}</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Đăng nhập</Link>
            <Link to="/register" style={styles.btnLink}>Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 32px', height: 60, background: '#1a1a2e', position: 'sticky',
    top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  brand: {},
  brandLink: { color: '#e94560', fontWeight: 700, fontSize: 22, textDecoration: 'none' },
  menu: { display: 'flex', gap: 20, alignItems: 'center' },
  link: { color: '#ccc', textDecoration: 'none', fontSize: 14, transition: 'color .2s' },
  btnLink: { background: '#e94560', color: '#fff', padding: '6px 16px',
    borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  logoutBtn: { background: 'transparent', border: '1px solid #e94560', color: '#e94560',
    padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
};

export default Navbar;
