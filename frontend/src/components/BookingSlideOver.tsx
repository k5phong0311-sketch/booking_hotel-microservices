import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Room, PaymentMethodType } from '../types';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';

interface BookingSlideOverProps {
  room: Room;
  onClose: () => void;
}

const BookingSlideOver: React.FC<BookingSlideOverProps> = ({ room, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('MOMO');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Slide animation state
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Kích hoạt animation trượt vào sau khi mount
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Đợi animation chạy xong mới unmount
  };

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const totalPrice = nights * (room?.pricePerNight || 0);
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (nights <= 0) { setError('Ngày trả phòng phải sau ngày nhận phòng'); return; }

    setError('');
    setSubmitting(true);
    try {
      const booking = await bookingService.create({
        userId: user.id, roomId: room.id, checkIn, checkOut,
      });

      const paymentRes = await paymentService.create({
        bookingId: booking.id,
        userId: user.id,
        amount: totalPrice,
        method: paymentMethod,
      });

      if (paymentMethod === 'MOMO' && paymentRes.momoUrl) {
        window.location.href = paymentRes.momoUrl; 
      } else {
        navigate('/my-bookings', { state: { newBookingId: booking.id, status: booking.status } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi hệ thống. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop (Nhấn ra ngoài để đóng) */}
      <div 
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      ></div>

      {/* Slide-over Panel */}
      <div className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-serif font-bold text-gray-900">Chi Tiết Đặt Phòng</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Room Info */}
          <div className="mb-8">
            <div className="h-48 rounded-xl overflow-hidden mb-4 bg-gray-100">
              {room.imageUrl ? (
                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-serif text-xl">BOOKINGHOTEL</div>
              )}
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">{room.name}</h3>
            <p className="text-sm text-brand-DEFAULT font-semibold uppercase tracking-wide mb-2">{room.type} • Tầng {room.floor}</p>
            <p className="text-gray-500 text-sm">{room.description}</p>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
                {error}
              </div>
            )}

            {!user && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 mb-4">
                Bạn cần <Link to="/login" className="font-bold underline">đăng nhập</Link> để thực hiện đặt phòng.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ngày Nhận (14:00)</label>
                <input 
                  type="date" 
                  value={checkIn} 
                  min={today}
                  onChange={e => setCheckIn(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/20 focus:border-brand-DEFAULT transition-all text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ngày Trả (12:00)</label>
                <input 
                  type="date" 
                  value={checkOut} 
                  min={checkIn || today}
                  onChange={e => setCheckOut(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/20 focus:border-brand-DEFAULT transition-all text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phương thức thanh toán</label>
              <select 
                value={paymentMethod} 
                onChange={e => setPaymentMethod(e.target.value as PaymentMethodType)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/20 focus:border-brand-DEFAULT transition-all text-sm outline-none cursor-pointer"
              >
                <option value="MOMO">Thanh toán qua Ví MoMo</option>
                <option value="CARD">Thẻ Tín dụng / Ghi nợ</option>
                <option value="TRANSFER">Chuyển khoản</option>
              </select>
            </div>

            {/* Price Summary */}
            {nights > 0 && (
              <div className="mt-6 bg-brand-light/50 p-5 rounded-xl border border-brand-DEFAULT/10">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Thời gian lưu trú:</span>
                  <span className="font-medium">{nights} đêm</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Giá mỗi đêm:</span>
                  <span className="font-medium">{Number(room.pricePerNight).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="border-t border-brand-DEFAULT/10 pt-4 flex justify-between items-end">
                  <span className="font-bold text-gray-900">TỔNG TIỀN:</span>
                  <span className="text-2xl font-bold text-brand-dark font-serif">
                    {totalPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            )}
            
            {/* Vị trí dự kiến cho Nhập Voucher (Phase 4) */}
            <div className="relative">
              <input type="text" placeholder="Nhập mã ưu đãi (Nếu có)" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-DEFAULT" disabled />
              <button type="button" className="absolute right-2 top-2 px-3 py-1 bg-gray-100 text-gray-400 rounded text-xs font-bold" disabled>Áp dụng</button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={submitting || nights <= 0 || !user}
              className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide uppercase transition-all shadow-md mt-4 ${
                (!user || nights <= 0) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                'bg-brand-dark text-white hover:bg-brand-DEFAULT hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN & THANH TOÁN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingSlideOver;
