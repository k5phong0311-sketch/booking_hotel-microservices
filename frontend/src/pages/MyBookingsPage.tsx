import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/booking.service';
import { Booking } from '../types';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showQR, setShowQR] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<number | null>(null);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    bookingService.getMyBookings(user.id)
      .then(data => setBookings(data))
      .catch(() => setError('Lỗi khi tải lịch sử đặt phòng.'))
      .finally(() => setLoading(false));
  };

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này?')) return;
    try {
      await bookingService.cancel(bookingId);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi hủy phòng');
    }
  };

  const handlePayAgain = async (booking: Booking) => {
    if (!user) return;
    setPayingId(booking.id);
    try {
      const res = await api.post('/payments', {
        bookingId: booking.id,
        userId: user.id,
        amount: Number(booking.totalPrice),
        method: 'MOMO',
      });
      if (res.data?.momoUrl) {
        window.location.href = res.data.momoUrl;
      } else {
        alert('Không nhận được đường dẫn thanh toán MoMo.');
        setPayingId(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi khởi tạo thanh toán MoMo');
      setPayingId(null);
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-accent-light/20 text-accent-dark border-accent-DEFAULT/20',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    FAILED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusLabel: Record<string, string> = {
    PENDING: 'Đang xử lý thanh toán', CONFIRMED: 'Đã xác nhận', CANCELLED: 'Đã hủy', FAILED: 'Thất bại'
  };

  return (
    <>

      {showQR !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative shadow-2xl">
            <button onClick={() => setShowQR(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-serif font-bold text-brand-dark mb-1">Thẻ Phòng Online</h2>
            <p className="text-gray-500 text-sm mb-6">Booking #{showQR}</p>
            <div className="border-4 border-brand-DEFAULT p-4 rounded-xl inline-block mb-6 shadow-sm bg-gray-50">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BOOKING_${showQR}`} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="font-bold text-gray-800">Quét mã này tại quầy lễ tân để nhận phòng nhanh chóng!</p>
          </div>
        </div>
      )}
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Chuyến đi của tôi</h1>
        <p className="text-gray-500 mb-8">Quản lý các đặt phòng và lịch sử lưu trú của bạn tại BOOKINGHOTEL.</p>

        {location.state?.newBookingId && (
          <div className="bg-accent-light/20 border border-accent-DEFAULT/30 text-accent-dark p-4 rounded-xl mb-8 flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <div>
              <p className="font-bold">Đặt phòng thành công!</p>
              <p className="text-sm">Mã đơn: {location.state.newBookingId} - Trạng thái: {statusLabel[location.state.status]}</p>
            </div>
          </div>
        )}

        {loading && <LoadingSpinner text="Đang tải dữ liệu..." />}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <p className="text-gray-500 mb-4">Bạn chưa có đơn đặt phòng nào.</p>
            <a href="/" className="inline-block px-6 py-2.5 bg-brand-dark text-white rounded font-medium hover:bg-brand-DEFAULT transition-colors">Khám phá ngay</a>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-3 w-max mx-auto ${statusColor[booking.status]}`}>
                    {statusLabel[booking.status] || booking.status}
                  </span>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mã đặt phòng</p>
                  <p className="font-mono font-bold text-gray-900">{booking.id}</p>
                </div>
                
                <div className="md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Phòng {booking.roomId}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Nhận phòng</p>
                        <p className="font-medium text-gray-900">{new Date(booking.checkIn).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Trả phòng</p>
                        <p className="font-medium text-gray-900">{new Date(booking.checkOut).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tổng thanh toán</p>
                      <p className="text-xl font-bold text-brand-dark font-serif">{Number(booking.totalPrice).toLocaleString('vi-VN')} đ</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {booking.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => setShowQR(booking.id)}
                          className="text-sm font-bold text-brand-dark hover:text-brand-DEFAULT hover:underline px-2 py-1"
                        >
                          Xem thẻ phòng
                        </button>
                      )}

                      {booking.status === 'PENDING' && (
                        <button 
                          onClick={() => handlePayAgain(booking)}
                          disabled={payingId === booking.id}
                          className="px-4 py-1.5 bg-[#a50064] hover:bg-[#860051] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                          {payingId === booking.id ? 'Đang mở MoMo...' : 'Thanh toán MoMo'}
                        </button>
                      )}

                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        <button 
                          onClick={() => handleCancel(booking.id)}
                          className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline px-2 py-1"
                        >
                          Hủy phòng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default MyBookingsPage;
