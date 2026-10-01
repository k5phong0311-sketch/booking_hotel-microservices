import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await authService.register(form.email, form.password, form.fullName, form.phone);
      login(data.access_token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 Đăng ký tài khoản</h2>
        <p style={styles.sub}>Tạo tài khoản để đặt phòng khách sạn dễ dàng hơn.</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { name: 'fullName', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn A' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
            { name: 'password', label: 'Mật khẩu (tối thiểu 6 ký tự)', type: 'password', placeholder: '••••••••' },
            { name: 'phone', label: 'Số điện thoại (tuỳ chọn)', type: 'tel', placeholder: '0901234567' },
          ].map(f => (
            <div key={f.name} style={styles.field}>
              <label style={styles.label}>{f.label}</label>
              <input style={styles.input} name={f.name} type={f.type}
                value={(form as any)[f.name]} onChange={handleChange}
                placeholder={f.placeholder} required={f.name !== 'phone'} />
            </div>
          ))}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>
        <p style={styles.footer}>
          Đã có tài khoản? <Link to="/login" style={styles.linkText}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f5f5f5', padding: 20 },
  card: { background: '#fff', padding: 40, borderRadius: 16, width: 420,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  title: { margin: '0 0 6px', fontSize: 26, color: '#1a1a2e', fontWeight: 700 },
  sub: { margin: '0 0 24px', color: '#888', fontSize: 14 },
  error: { background: '#fff0f0', border: '1px solid #ffcccc', color: '#c0392b',
    padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#444' },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '12px',
    borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' },
  linkText: { color: '#e94560', fontWeight: 600, textDecoration: 'none' },
};

export default RegisterPage;
