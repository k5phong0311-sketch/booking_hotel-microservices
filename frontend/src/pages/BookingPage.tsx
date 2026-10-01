import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/room.service';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';
import { Room, PaymentMethodType } from '../types';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('MOMO');

  useEffect(() => {
    if (!roomId) return;
    roomService.getOne(Number(roomId))
      .then(setRoom)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [roomId]);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const totalPrice = nights * (room?.pricePerNight || 0);
  const deposit = totalPrice * 0.3; // Đặt cọc 30%

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !room) return;
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

  if (loading) return <LoadingSpinner text="Đang chuẩn bị..." />;
  if (!room) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.back}>← TRỞ LẠI</button>
        <h2 style={styles.title}>THÔNG TIN ĐẶT PHÒNG</h2>

        <div style={styles.layout}>
          <div style={styles.formCard}>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>NGÀY NHẬN PHÒNG</label>
                  <input style={styles.input} type="date" value={checkIn} min={today}
                    onChange={e => setCheckIn(e.target.value)} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>NGÀY TRẢ PHÒNG</label>
                  <input style={styles.input} type="date" value={checkOut} min={checkIn || today}
                    onChange={e => setCheckOut(e.target.value)} required />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>THÔNG TIN KHÁCH HÀNG</label>
                <input style={{ ...styles.input, color: '#aaa' }}
                  value={`${user?.fullName} - ${user?.email}`} readOnly />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>PHƯƠNG THỨC THANH TOÁN</label>
                <select 
                  style={styles.select} 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethodType)}
                >
                  <option value="MOMO">Thanh toán qua Ví MoMo</option>
                  <option value="CARD">Thẻ tín dụng / Thẻ ghi nợ</option>
                  <option value="TRANSFER">Chuyển khoản ngân hàng</option>
                </select>
              </div>

              {nights > 0 && (
                <div style={styles.summary}>
                  <div style={styles.summaryRow}>
                    <span>Thời gian lưu trú:</span>
                    <span>{nights} đêm</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Giá mỗi đêm:</span>
                    <span>{Number(room.pricePerNight).toLocaleString('vi-VN')} VND</span>
                  </div>
                  <hr style={styles.divider} />
                  <div style={styles.summaryRow}>
                    <span style={{color: '#fff', fontSize: 16}}>TỔNG CỘNG:</span>
                    <span style={styles.total}>{totalPrice.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{color: '#888', fontSize: 12}}>Yêu cầu đặt cọc (30%):</span>
                    <span style={{color: '#c5a059', fontSize: 14}}>{deposit.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              )}

              <button type="submit" style={styles.btn} disabled={submitting || nights <= 0}>
                {submitting ? 'ĐANG XỬ LÝ...' : (paymentMethod === 'MOMO' ? 'THANH TOÁN MOMO' : 'XÁC NHẬN ĐẶT PHÒNG')}
              </button>
            </form>
          </div>

          <div style={styles.roomCard}>
            <div style={styles.imgBox}>
               {room.imageUrl ? <img src={room.imageUrl} alt={room.name} style={styles.roomImg} /> : <div style={styles.placeholder}>BOOKINGHOTEL</div>}
            </div>
            <div style={styles.roomInfo}>
               <h4 style={styles.roomName}>{room.name}</h4>
               <p style={styles.roomType}>{room.type} / Tầng {room.floor}</p>
               <p style={styles.roomDesc}>{room.description || 'Không gian sang trọng bậc nhất với tầm nhìn toàn cảnh thành phố.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#0b0c10', minHeight: '100vh', padding: '60px 20px', color: '#e0e0e0' },
  container: { maxWidth: 1000, margin: '0 auto' },
  back: { background: 'none', border: 'none', padding: '0 0 20px', cursor: 'pointer', color: '#c5a059', fontSize: 12, letterSpacing: '2px', fontWeight: 600 },
  title: { margin: '0 0 40px', fontSize: 28, color: '#fff', fontWeight: 400, letterSpacing: '3px', fontFamily: 'Montserrat' },
  layout: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40 },
  formCard: { background: '#111217', padding: 40, border: '1px solid #222' },
  error: { background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', color: '#e74c3c', padding: 16, marginBottom: 24, fontSize: 13, letterSpacing: '1px' },
  form: { display: 'flex', flexDirection: 'column', gap: 24 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 11, fontWeight: 600, color: '#c5a059', letterSpacing: '1.5px' },
  input: { padding: '12px 16px', background: '#0b0c10', border: '1px solid #333', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'Plus Jakarta Sans' },
  select: { padding: '12px 16px', background: '#0b0c10', border: '1px solid #333', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'Plus Jakarta Sans', cursor: 'pointer' },
  summary: { background: '#0b0c10', padding: 24, border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: 12 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#aaa' },
  divider: { width: '100%', height: 1, background: '#222', border: 'none', margin: '8px 0' },
  total: { fontSize: 20, color: '#c5a059', fontFamily: 'Montserrat', fontWeight: 600 },
  btn: { background: '#c5a059', color: '#0b0c10', border: 'none', padding: '16px', marginTop: 10, fontSize: 13, fontWeight: 700, letterSpacing: '2px', cursor: 'pointer', transition: '0.3s' },
  roomCard: { background: '#111217', border: '1px solid #222', alignSelf: 'start', display: 'flex', flexDirection: 'column' },
  imgBox: { height: 280, background: '#0b0c10', position: 'relative' },
  roomImg: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a059', fontSize: 32, letterSpacing: '4px', fontFamily: 'Montserrat' },
  roomInfo: { padding: 32 },
  roomName: { margin: '0 0 8px', fontSize: 22, color: '#fff', fontFamily: 'Montserrat', fontWeight: 400 },
  roomType: { margin: '0 0 16px', color: '#c5a059', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase' },
  roomDesc: { margin: 0, color: '#888', fontSize: 14, lineHeight: 1.6 },
};

export default BookingPage;
