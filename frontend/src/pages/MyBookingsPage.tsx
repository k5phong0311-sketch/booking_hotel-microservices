import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const statusLabel: Record<string, { text: string; color: string }> = {
  PENDING:   { text: '⏳ Chờ xử lý',   color: '#f39c12' },
  CONFIRMED: { text: '✅ Đã xác nhận', color: '#27ae60' },
  CANCELED:  { text: '🚫 Đã hủy',      color: '#95a5a6' },
  FAILED:    { text: '❌ Thất bại',    color: '#e74c3c' },
};

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const newBookingId = (location.state as any)?.newBookingId;

  const fetchBookings = () => {
    if (!user) return;
    bookingService.getMyBookings(user.id)
      .then(data => setBookings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc muốn hủy đơn đặt phòng này?')) return;
    setCancelingId(id);
    try {
      await bookingService.cancel(id);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy đơn. Thử lại sau.');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải lịch sử đặt phòng..." />;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>📋 Đơn đặt phòng của tôi</h2>

        {newBookingId && (
          <div style={styles.successBanner}>
            🎉 Đặt phòng thành công! Mã đơn: <strong>#{newBookingId}</strong>
          </div>
        )}

        {bookings.length === 0
          ? <div style={styles.empty}>
              <p style={{ fontSize: 48 }}>📭</p>
              <p>Bạn chưa có đơn đặt phòng nào.</p>
            </div>
          : <div style={styles.list}>
              {bookings.map(b => {
                const s = statusLabel[b.status] || { text: b.status, color: '#999' };
                return (
                  <div key={b.id} style={{ ...styles.card, ...(b.id === newBookingId ? styles.highlight : {}) }}>
                    <div style={styles.cardHeader}>
                      <span style={styles.bookingId}>Đơn #{b.id}</span>
                      <span style={{ ...styles.badge, background: s.color }}>{s.text}</span>
                    </div>
                    <div style={styles.cardBody}>
                      <div style={styles.row}>
                        <span>🏠 Phòng số</span><strong>#{b.roomId}</strong>
                      </div>
                      <div style={styles.row}>
                        <span>📅 Nhận phòng</span><strong>{new Date(b.checkIn).toLocaleDateString('vi-VN')}</strong>
                      </div>
                      <div style={styles.row}>
                        <span>📅 Trả phòng</span><strong>{new Date(b.checkOut).toLocaleDateString('vi-VN')}</strong>
                      </div>
                      <div style={styles.row}>
                        <span>💰 Tổng tiền</span>
                        <strong style={{ color: '#e94560' }}>{Number(b.totalPrice).toLocaleString('vi-VN')}đ</strong>
                      </div>
                      <div style={styles.row}>
                        <span>🕐 Đặt lúc</span><strong>{new Date(b.createdAt).toLocaleString('vi-VN')}</strong>
                      </div>
                    </div>
                    {b.status === 'CONFIRMED' && (
                      <button onClick={() => handleCancel(b.id)} disabled={cancelingId === b.id}
                        style={styles.cancelBtn}>
                        {cancelingId === b.id ? 'Đang hủy...' : '🚫 Hủy đơn'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
        }
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#f8f9fa', minHeight: '100vh', padding: '32px 20px' },
  container: { maxWidth: 800, margin: '0 auto' },
  title: { margin: '0 0 24px', fontSize: 26, color: '#1a1a2e', fontWeight: 700 },
  successBanner: { background: '#eafaf1', border: '1px solid #a9dfbf', color: '#1e8449',
    padding: '14px 20px', borderRadius: 10, marginBottom: 24, fontSize: 15 },
  empty: { textAlign: 'center', padding: 80, color: '#888', fontSize: 16 },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: '#fff', borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  highlight: { border: '2px solid #27ae60' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee' },
  bookingId: { fontWeight: 700, color: '#1a1a2e', fontSize: 15 },
  badge: { color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  cardBody: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555' },
  cancelBtn: { width: '100%', background: 'none', border: 'none', borderTop: '1px solid #eee',
    padding: '12px', cursor: 'pointer', color: '#e74c3c', fontWeight: 600, fontSize: 14 },
};

export default MyBookingsPage;
