import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/room.service';
import api from '../services/api';
import { Room } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

interface ReviewItem {
  id: number;
  roomId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchReviews = (roomId: number) => {
    api.get<ReviewItem[]>(`/reviews/room/${roomId}`)
      .then(res => setReviews(res.data || []))
      .catch(() => setReviews([]));
  };

  useEffect(() => {
    if (!id) return;
    const roomId = Number(id);
    roomService.getOne(roomId)
      .then(data => {
        setRoom(data);
        fetchReviews(roomId);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAskCSKH = () => {
    window.dispatchEvent(new CustomEvent('openChat', { detail: room ? `Tôi muốn hỏi về ${room.name} (Phòng #${room.id})` : '' }));
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${id}`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !room) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        roomId: room.id,
        userId: user.id,
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setRating(5);
      fetchReviews(room.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!room || !window.confirm('Bạn muốn xóa đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviews(room.id);
    } catch {
      alert('Không thể xóa đánh giá.');
    }
  };

  const typeLabel: Record<string, string> = {
    SINGLE: 'Phòng đơn', DOUBLE: 'Phòng đôi', SUITE: 'Suite', DELUXE: 'Deluxe',
  };

  if (loading) return <LoadingSpinner text="Đang tải thông tin phòng..." />;
  if (!room) return null;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.back}>← Quay lại</button>

        <div style={styles.card}>
          <div style={styles.imgWrap}>
            {room.imageUrl
              ? <img src={room.imageUrl} alt={room.name} style={styles.img} />
              : <div style={styles.placeholder}>🛏️</div>}
          </div>
          <div style={styles.info}>
            <div style={styles.badges}>
              <span style={styles.typeBadge}>{typeLabel[room.type]}</span>
              <span style={{ ...styles.availBadge, background: room.isAvailable ? '#27ae60' : '#e74c3c' }}>
                {room.isAvailable ? '✅ Còn phòng' : '❌ Hết phòng'}
              </span>
              {avgRating && (
                <span style={{ background: '#fff8e1', color: '#f39c12', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  ⭐ {avgRating}/5 ({reviews.length} đánh giá)
                </span>
              )}
            </div>
            <h1 style={styles.name}>{room.name}</h1>
            <p style={styles.floor}>🏢 Tầng {room.floor}</p>
            <p style={styles.desc}>{room.description || 'Phòng tiện nghi, đầy đủ trang thiết bị hiện đại.'}</p>

            <div style={styles.priceBox}>
              <span style={styles.price}>{Number(room.pricePerNight).toLocaleString('vi-VN')}đ</span>
              <span style={styles.perNight}>/đêm</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={handleBook}
                disabled={!room.isAvailable}
                style={{ ...styles.bookBtn, opacity: room.isAvailable ? 1 : 0.5, flex: 1 }}>
                {room.isAvailable
                  ? (isAuthenticated ? '📅 Đặt phòng ngay' : '🔐 Đăng nhập để đặt phòng')
                  : 'Phòng đã hết'}
              </button>
              <button onClick={handleAskCSKH} style={styles.askBtn}>
                💬 Hỏi CSKH
              </button>
            </div>
          </div>
        </div>

        {/* Phần Đánh giá & Nhận xét (Review Service) */}
        <div style={styles.reviewSection}>
          <h2 style={styles.reviewTitle}>
            ⭐ Đánh giá từ khách hàng ({reviews.length})
          </h2>

          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: '#333', fontSize: 14 }}>Chọn số sao:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 24,
                        cursor: 'pointer',
                        color: star <= rating ? '#f1c40f' : '#ddd',
                        padding: 0,
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#666' }}>({rating}/5 sao)</span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
                  required
                  style={styles.reviewInput}
                />
                <button type="submit" disabled={submittingReview} style={styles.reviewSubmitBtn}>
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          ) : (
            <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
              Vui lòng <a href="/login" style={{ color: '#e94560', fontWeight: 700 }}>đăng nhập</a> để gửi đánh giá cho phòng này.
            </p>
          )}

          {reviews.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>
              Chưa có đánh giá nào cho phòng này. Hãy là người đầu tiên đánh giá!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map(rev => (
                <div key={rev.id} style={styles.reviewItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>
                        Khách hàng #{rev.userId}
                      </span>
                      <span style={{ color: '#f1c40f', fontSize: 15 }}>
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, color: '#999' }}>
                        {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      {(user?.role === 'ADMIN' || user?.id === rev.userId) && (
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: 0, color: '#444', fontSize: 14, lineHeight: 1.5 }}>
                    {rev.comment || 'Khách hàng đánh giá tốt.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#f8f9fa', minHeight: '100vh', padding: '100px 20px 40px' },
  container: { maxWidth: 900, margin: '0 auto' },
  back: { background: 'none', border: '1px solid #ddd', padding: '8px 16px',
    borderRadius: 8, cursor: 'pointer', marginBottom: 24, color: '#555' },
  card: { background: '#fff', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)', display: 'grid',
    gridTemplateColumns: '1fr 1fr' },
  imgWrap: { height: 400, background: '#f0f0f0' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', fontSize: 100 },
  info: { padding: 40, display: 'flex', flexDirection: 'column', gap: 12 },
  badges: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  typeBadge: { background: '#1a1a2e', color: '#fff', padding: '4px 12px',
    borderRadius: 20, fontSize: 12, fontWeight: 600 },
  availBadge: { color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  name: { margin: 0, fontSize: 28, fontWeight: 800, color: '#1a1a2e' },
  floor: { margin: 0, color: '#888', fontSize: 14 },
  desc: { color: '#666', lineHeight: 1.6, fontSize: 15 },
  priceBox: { display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 },
  price: { fontSize: 32, fontWeight: 800, color: '#e94560' },
  perNight: { fontSize: 16, color: '#888' },
  askBtn: { background: '#2c3e50', color: '#fff', border: 'none', padding: '14px 20px', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  bookBtn: { background: '#e94560', color: '#fff', border: 'none', padding: '14px 0',
    borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  reviewSection: { marginTop: 32, background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' },
  reviewTitle: { margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: '#1a1a2e' },
  reviewForm: { background: '#f8f9fa', padding: 20, borderRadius: 12, marginBottom: 24, border: '1px solid #eee' },
  reviewInput: { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, outline: 'none' },
  reviewSubmitBtn: { background: '#1a1a2e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  reviewItem: { padding: 16, borderRadius: 10, border: '1px solid #f0f0f0', background: '#fafafa' },
};

export default RoomDetailPage;

