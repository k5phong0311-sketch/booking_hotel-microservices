import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register({ email, password, fullName, phone });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-brand-DEFAULT/10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block w-12 h-12 bg-brand-dark rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-serif font-bold text-2xl">L</span>
          </Link>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Tạo tài khoản mới</h2>
          <p className="text-gray-500 text-sm">Gia nhập cộng đồng thượng lưu của LUXUS</p>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-6 text-center border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Họ và Tên</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/20 outline-none text-sm" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Số điện thoại</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/20 outline-none text-sm" placeholder="0901234567" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/20 outline-none text-sm" placeholder="example@email.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Mật khẩu</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/20 outline-none text-sm" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-brand-dark text-white rounded-lg font-bold tracking-wide uppercase hover:bg-brand-DEFAULT transition-all shadow-md mt-6">
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Đã có tài khoản? <Link to="/login" className="text-brand-DEFAULT font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
