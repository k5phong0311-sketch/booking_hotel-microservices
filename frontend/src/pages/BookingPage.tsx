import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/room.service';
import { bookingService } from '../services/booking.service';
import { Room } from '../types';
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

  useEffect(() => {
    if (!roomId) return;
    roomService.getOne(Number(roomId))
      .then(setRoom)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [roomId]);

  // Tính số đêm và tổng tiền
  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const totalPrice = nights * (room?.pricePerNight || 0);

  // Ngày tối thiểu là hôm nay
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
      navigate('/my-bookings', { state: { newBookingId: booking.id, status: booking.status } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đặt phòng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải thông tin phòng..." />;
  if (!room) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.back}>← Quay lại</button>
        <h2 style={styles.title}>📅 Đặt phòng</h2>

        <div style={styles.layout}>
          {/* Form đặt phòng */}
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Thông tin đặt phòng</h3>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Ngày nhận phòng</label>
                <input style={styles.input} type="date" value={checkIn} min={today}
                  onChange={e => setCheckIn(e.target.value)} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Ngày trả phòng</label>
                <input style={styles.input} type="date" value={checkOut} min={checkIn || today}
                  onChange={e => setCheckOut(e.target.value)} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Khách hàng</label>
                <input style={{ ...styles.input, background: '#f5f5f5' }}
                  value={`${user?.fullName} (${user?.email})`} readOnly />
              </div>

              {nights > 0 && (
                <div style={styles.summary}>
                  <p>🌙 Số đêm: <strong>{nights}</strong></p>
                  <p>💰 Giá/đêm: <strong>{Number(room.pricePerNight).toLocaleString('vi-VN')}đ</strong></p>
                  <hr style={{ border: 'none', borderTop: '1px dashed #ddd' }} />
                  <p style={styles.total}>Tổng cộng: <strong>{totalPrice.toLocaleString('vi-VN')}đ</strong></p>
                </div>
              )}

              <button type="submit" style={styles.btn} disabled={submitting || nights <= 0}>
                {submitting ? '⏳ Đang xử lý...' : '✅ Xác nhận đặt phòng'}
              </button>
            </form>
          </div>

          {/* Thông tin phòng */}
          <div style={styles.roomCard}>
            <h3 style={styles.formTitle}>Phòng đã chọn</h3>
            {room.imageUrl
              ? <img src={room.imageUrl} alt={room.name} style={styles.roomImg} />
              : <div style={styles.roomPlaceholder}>🛏️</div>}
            <h4 style={styles.roomName}>{room.name}</h4>
            <p style={styles.roomType}>🏷️ {room.type} — Tầng {room.floor}</p>
            <p style={styles.roomPrice}>{Number(room.pricePerNight).toLocaleString('vi-VN')}đ/đêm</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#f8f9fa', minHeight: '100vh', padding: '32px 20px' },
  container: { maxWidth: 900, margin: '0 auto' },
  back: { background: 'none', border: '1px solid #ddd', padding: '8px 16px',
    borderRadius: 8, cursor: 'pointer', marginBottom: 16, color: '#555' },
  title: { margin: '0 0 24px', fontSize: 26, color: '#1a1a2e', fontWeight: 700 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 },
  formCard: { background: '#fff', padding: 32, borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  formTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#1a1a2e' },
  error: { background: '#fff0f0', border: '1px solid #fcc', color: '#c0392b',
    padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#444' },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  summary: { background: '#f8f9fa', padding: 16, borderRadius: 10, fontSize: 14, lineHeight: 1.8 },
  total: { fontSize: 16, color: '#e94560' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '14px',
    borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  roomCard: { background: '#fff', padding: 24, borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)', alignSelf: 'start' },
  roomImg: { width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 12 },
  roomPlaceholder: { height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 64, background: '#f0f0f0', borderRadius: 8, marginBottom: 12 },
  roomName: { margin: '0 0 6px', fontSize: 18, fontWeight: 700 },
  roomType: { margin: '0 0 6px', color: '#888', fontSize: 13 },
  roomPrice: { fontSize: 20, fontWeight: 700, color: '#e94560', margin: 0 },
};

export default BookingPage;
