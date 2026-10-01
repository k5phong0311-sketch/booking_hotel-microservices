import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/room.service';
import { Room } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    roomService.getOne(Number(id))
      .then(setRoom)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${id}`);
  };

  const typeLabel: Record<string, string> = {
    SINGLE: 'Phòng đơn', DOUBLE: 'Phòng đôi', SUITE: 'Suite', DELUXE: 'Deluxe',
  };

  if (loading) return <LoadingSpinner text="Đang tải thông tin phòng..." />;
  if (!room) return null;

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
            </div>
            <h1 style={styles.name}>{room.name}</h1>
            <p style={styles.floor}>🏢 Tầng {room.floor}</p>
            <p style={styles.desc}>{room.description || 'Phòng tiện nghi, đầy đủ trang thiết bị hiện đại.'}</p>

            <div style={styles.priceBox}>
              <span style={styles.price}>{Number(room.pricePerNight).toLocaleString('vi-VN')}đ</span>
              <span style={styles.perNight}>/đêm</span>
            </div>

            <button onClick={handleBook}
              disabled={!room.isAvailable}
              style={{ ...styles.bookBtn, opacity: room.isAvailable ? 1 : 0.5 }}>
              {room.isAvailable
                ? (isAuthenticated ? '📅 Đặt phòng ngay' : '🔐 Đăng nhập để đặt phòng')
                : 'Phòng đã hết'}
            </button>
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
    borderRadius: 8, cursor: 'pointer', marginBottom: 24, color: '#555' },
  card: { background: '#fff', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)', display: 'grid',
    gridTemplateColumns: '1fr 1fr' },
  imgWrap: { height: 400, background: '#f0f0f0' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', fontSize: 100 },
  info: { padding: 40, display: 'flex', flexDirection: 'column', gap: 12 },
  badges: { display: 'flex', gap: 8 },
  typeBadge: { background: '#1a1a2e', color: '#fff', padding: '4px 12px',
    borderRadius: 20, fontSize: 12, fontWeight: 600 },
  availBadge: { color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  name: { margin: 0, fontSize: 28, fontWeight: 800, color: '#1a1a2e' },
  floor: { margin: 0, color: '#888', fontSize: 14 },
  desc: { color: '#666', lineHeight: 1.6, fontSize: 15 },
  priceBox: { display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 },
  price: { fontSize: 32, fontWeight: 800, color: '#e94560' },
  perNight: { fontSize: 16, color: '#888' },
  bookBtn: { background: '#e94560', color: '#fff', border: 'none', padding: '14px 0',
    borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
};

export default RoomDetailPage;
