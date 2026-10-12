import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Room } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
}

interface VoucherItem {
  id: number;
  code: string;
  discountPercentage: number;
  quantity: number;
  usedCount: number;
}

const BookingSlideOver: React.FC<Props> = ({ isOpen, onClose, room }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MOMO');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [voucherMsg, setVoucherMsg] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState<VoucherItem[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSubmitting(false);
      setCheckIn(today);
      setCheckOut('');
      setVoucherCode('');
      setDiscountPercent(0);
      setVoucherMsg('');
    } else {
      api.get<VoucherItem[]>('/vouchers')
        .then(res => setAvailableVouchers((res.data || []).filter(v => v.quantity - v.usedCount > 0)))
        .catch(() => setAvailableVouchers([]));
    }
  }, [isOpen]);

  if (!room) return null;

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const rawTotal = nights > 0 ? nights * Number(room.pricePerNight) : 0;
  const discountAmount = Math.round((rawTotal * discountPercent) / 100);
  const totalPrice = Math.max(0, rawTotal - discountAmount);

  const handleClose = () => { if (!submitting) onClose(); };

  const handleApplyVoucher = async (codeToApply?: string) => {
    const code = (codeToApply ?? voucherCode).trim().toUpperCase();
    if (!code) return;
    setVoucherCode(code);
    setVoucherMsg('');
    try {
      const res = await api.post('/vouchers/apply', { code });
      const pct = Number(res.data?.discountPercentage) || 0;
      setDiscountPercent(pct);
      setVoucherMsg(`✅ Đã áp dụng mã ${code} (-${pct}%)`);
    } catch (err: any) {
      setDiscountPercent(0);
      setVoucherMsg(`❌ ${err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết lượt'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (nights <= 0) { setError('Ngày trả phòng phải sau ngày nhận phòng'); return; }

    setError('');
    setSubmitting(true);
    try {
      const bRes = await api.post('/bookings', { userId: user.id, roomId: room.id, checkIn, checkOut });
      const booking = bRes.data;
      const paymentRes = await api.post('/payments', { bookingId: booking.id, userId: user.id, amount: totalPrice, method: paymentMethod });
      
      if (paymentMethod === 'MOMO' && paymentRes.data?.momoUrl) {
        window.location.href = paymentRes.data.momoUrl;
      } else {
        navigate('/my-bookings', { state: { newBookingId: booking.id, status: booking.status } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi hệ thống. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}></div>
      <div className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-serif font-bold text-gray-900">Chi Tiết Đặt Phòng</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            X
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="h-44 rounded-xl overflow-hidden mb-4 bg-gray-100">
              {room.imageUrl ? <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-serif text-xl">BOOKINGHOTEL</div>}
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">{room.name}</h3>
            <p className="text-sm text-brand-DEFAULT font-semibold uppercase tracking-wide mb-2">{room.type} • Tầng {room.floor}</p>
            <p className="text-gray-500 text-sm">{room.description}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">{error}</div>}
            {!user && <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 mb-4">Bạn cần <Link to="/login" className="font-bold underline">đăng nhập</Link> để thực hiện đặt phòng.</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ngày Nhận (14:00)</label>
                <input type="date" value={checkIn} min={today} onChange={e => setCheckIn(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ngày Trả (12:00)</label>
                <input type="date" value={checkOut} min={checkIn || today} onChange={e => setCheckOut(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
            </div>

            {/* Ô nhập Mã khuyến mãi (Voucher) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Mã Khuyến Mãi (Voucher)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá (VD: SUMMER20)"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none uppercase font-semibold text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleApplyVoucher()}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
              {voucherMsg && (
                <p className={`text-xs font-semibold mt-1.5 ${voucherMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                  {voucherMsg}
                </p>
              )}
              {availableVouchers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-gray-400">Mã đang có:</span>
                  {availableVouchers.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleApplyVoucher(v.code)}
                      className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold cursor-pointer"
                    >
                      🏷️ {v.code} (-{v.discountPercentage}%)
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Hình thức thanh toán</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer">
                <option value="MOMO">THANH TOÁN NGAY - Cổng MoMo (Thẻ ATM Napas)</option>
                <option value="CASH">ĐẶT TRƯỚC - Thanh toán tại quầy</option>
              </select>
              {paymentMethod === 'MOMO' && (
                <div className="mt-2 p-3 bg-pink-50/70 border border-pink-200 rounded-lg text-xs text-gray-700 leading-relaxed">
                  <p className="font-bold text-[#a50064] mb-1">💡 Thẻ ATM nội địa Napas Test:</p>
                  <p>• Số thẻ: <strong className="select-all">9704000000000018</strong> | Ngày: <strong>03/07</strong></p>
                  <p>• Chủ thẻ: <strong>NGUYEN VAN A</strong> | OTP: <strong>123456</strong></p>
                </div>
              )}
            </div>
            {nights > 0 && (
              <div className="mt-4 bg-brand-light/50 p-5 rounded-xl border border-brand-DEFAULT/10">
                <div className="flex justify-between text-sm text-gray-600 mb-2"><span>Thời gian lưu trú:</span><span className="font-medium">{nights} đêm</span></div>
                <div className="flex justify-between text-sm text-gray-600 mb-2"><span>Giá mỗi đêm:</span><span className="font-medium">{Number(room.pricePerNight).toLocaleString('vi-VN')} VND</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-semibold mb-2">
                    <span>Giảm giá Voucher (-{discountPercent}%):</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')} VND</span>
                  </div>
                )}
                <div className="border-t border-brand-DEFAULT/10 pt-3 mt-2 flex justify-between items-end"><span className="font-bold text-gray-900">TỔNG TIỀN:</span><span className="text-2xl font-bold text-brand-dark font-serif">{totalPrice.toLocaleString('vi-VN')} VND</span></div>
              </div>
            )}
            <button type="submit" disabled={submitting || nights <= 0 || !user} className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide uppercase mt-4 ${(!user || nights <= 0) ? 'bg-gray-200 text-gray-400' : 'bg-brand-dark text-white hover:bg-brand-DEFAULT cursor-pointer'}`}>
              {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN & THANH TOÁN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default BookingSlideOver;
