import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      login(data.access_token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Đăng nhập</h2>
        <p style={styles.sub}>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mật khẩu</label>
            <input style={styles.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p style={styles.footer}>
          Chưa có tài khoản? <Link to="/register" style={styles.linkText}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f5f5f5' },
  card: { background: '#fff', padding: 40, borderRadius: 16, width: 400,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  title: { margin: '0 0 6px', fontSize: 26, color: '#1a1a2e', fontWeight: 700 },
  sub: { margin: '0 0 24px', color: '#888', fontSize: 14 },
  error: { background: '#fff0f0', border: '1px solid #ffcccc', color: '#c0392b',
    padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#444' },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd',
    fontSize: 14, outline: 'none' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '12px',
    borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' },
  linkText: { color: '#e94560', fontWeight: 600, textDecoration: 'none' },
};

export default LoginPage;
