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
        <Link to="/" style={styles.brandLink}>LUXUS HOTEL</Link>
      </div>
      <div style={styles.menu}>
        <Link to="/" style={styles.link}>Trang chủ</Link>
        <Link to="/" style={styles.link}>Danh sách phòng</Link>
        {isAuthenticated ? (
          <>
            <Link to="/my-bookings" style={styles.link}>Đơn đặt phòng</Link>
            <Link to="/profile" style={styles.link}>
              <span style={{ color: '#c5a059' }}>{user?.fullName}</span>
            </Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Đăng nhập</Link>
            <Link to="/register" style={styles.btnLink}>ĐĂNG KÝ</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '0 40px', 
    height: 70, 
    background: 'rgba(11, 12, 16, 0.95)', 
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0, 
    zIndex: 100, 
    borderBottom: '1px solid rgba(197, 160, 89, 0.2)' 
  },
  brand: {},
  brandLink: { 
    color: '#c5a059', 
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700, 
    fontSize: 24, 
    letterSpacing: '2px',
    textDecoration: 'none' 
  },
  menu: { display: 'flex', gap: 28, alignItems: 'center' },
  link: { 
    color: '#e0e0e0', 
    textDecoration: 'none', 
    fontSize: 14, 
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'color .3s' 
  },
  btnLink: { 
    background: '#c5a059', 
    color: '#0b0c10', 
    padding: '10px 24px',
    borderRadius: 2, 
    textDecoration: 'none', 
    fontSize: 13, 
    fontWeight: 700,
    letterSpacing: '1px',
    transition: 'all 0.3s ease'
  },
  logoutBtn: { 
    background: 'transparent', 
    border: '1px solid #c5a059', 
    color: '#c5a059',
    padding: '8px 20px', 
    borderRadius: 2, 
    cursor: 'pointer', 
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease'
  },
};

export default Navbar;
