import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-brand-DEFAULT/10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block w-12 h-12 bg-brand-dark rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-serif font-bold text-2xl">B</span>
          </Link>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Đăng nhập hệ thống</h2>
          <p className="text-gray-500 text-sm">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-6 text-center border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email của bạn</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/20 focus:border-brand-DEFAULT transition-all outline-none"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Mật khẩu</label>
              <a href="#" className="text-xs text-brand-DEFAULT font-medium hover:underline">Quên mật khẩu?</a>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/20 focus:border-brand-DEFAULT transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-brand-dark text-white rounded-lg font-bold tracking-wide uppercase hover:bg-brand-DEFAULT transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Chưa có tài khoản? <Link to="/register" className="text-brand-DEFAULT font-bold hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
