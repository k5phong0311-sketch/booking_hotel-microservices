import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const fields = [
    { label: 'Họ và tên', value: user.fullName },
    { label: 'Email', value: user.email },
    { label: 'Số điện thoại', value: user.phone || '—' },
    { label: 'Vai trò', value: user.role === 'ADMIN' ? '👑 Admin' : '👤 Khách hàng' },
    { label: 'Ngày tạo', value: new Date(user.createdAt).toLocaleDateString('vi-VN') },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Avatar */}
          <div style={styles.avatarWrap}>
            <div style={styles.avatar}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <h2 style={styles.name}>{user.fullName}</h2>
            <p style={styles.email}>{user.email}</p>
          </div>

          {/* Info */}
          <div style={styles.infoBlock}>
            <h3 style={styles.sectionTitle}>Thông tin cá nhân</h3>
            {fields.map(f => (
              <div key={f.label} style={styles.row}>
                <span style={styles.rowLabel}>{f.label}</span>
                <span style={styles.rowValue}>{f.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button onClick={() => navigate('/my-bookings')} style={styles.primaryBtn}>
              📋 Xem đơn đặt phòng của tôi
            </button>
            <button onClick={handleLogout} style={styles.dangerBtn}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#f8f9fa', minHeight: '100vh', padding: '40px 20px' },
  container: { maxWidth: 520, margin: '0 auto' },
  card: { background: '#fff', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)' },
  avatarWrap: { background: 'linear-gradient(135deg, #1a1a2e, #e94560)',
    padding: '40px 20px', textAlign: 'center', color: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, fontWeight: 700, margin: '0 auto 12px' },
  name: { margin: '0 0 4px', fontSize: 22, fontWeight: 700 },
  email: { margin: 0, fontSize: 14, opacity: 0.8 },
  infoBlock: { padding: '24px 28px' },
  sectionTitle: { margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#888',
    textTransform: 'uppercase', letterSpacing: 1 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '12px 0',
    borderBottom: '1px solid #f0f0f0', fontSize: 14 },
  rowLabel: { color: '#888' },
  rowValue: { fontWeight: 600, color: '#1a1a2e' },
  actions: { padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 10 },
  primaryBtn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '12px',
    borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  dangerBtn: { background: 'none', border: '1px solid #e74c3c', color: '#e74c3c',
    padding: '12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
};

export default ProfilePage;
