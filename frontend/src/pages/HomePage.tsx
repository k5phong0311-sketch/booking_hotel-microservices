import React, { useEffect, useState } from 'react';
import { roomService } from '../services/room.service';
import { Room } from '../types';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    roomService.getAll()
      .then(data => setRooms(data))
      .catch(() => setError('Không thể tải danh sách phòng. Backend có đang chạy không?'))
      .finally(() => setLoading(false));
  }, []);

  const types = ['ALL', 'SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'];
  const typeLabel: Record<string, string> = {
    ALL: 'Tất cả', SINGLE: 'Phòng đơn', DOUBLE: 'Phòng đôi', SUITE: 'Suite', DELUXE: 'Deluxe'
  };

  const filtered = filter === 'ALL' ? rooms : rooms.filter(r => r.type === filter);

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🏨 Tìm phòng khách sạn hoàn hảo</h1>
        <p style={styles.heroSub}>Đặt phòng nhanh chóng, giá tốt nhất, trải nghiệm tuyệt vời</p>
      </div>

      <div style={styles.container}>
        {/* Filter tabs */}
        <div style={styles.filters}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ ...styles.filterBtn, ...(filter === t ? styles.filterActive : {}) }}>
              {typeLabel[t]}
            </button>
          ))}
        </div>

        {loading && <LoadingSpinner text="Đang tải danh sách phòng..." />}
        {error && <div style={styles.error}>⚠️ {error}</div>}

        {!loading && !error && (
          <>
            <p style={styles.count}>Tìm thấy <strong>{filtered.length}</strong> phòng</p>
            {filtered.length === 0
              ? <div style={styles.empty}>😔 Không có phòng nào phù hợp</div>
              : <div style={styles.grid}>
                  {filtered.map(room => <RoomCard key={room.id} room={room} />)}
                </div>
            }
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#f8f9fa', minHeight: '100vh' },
  hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#fff', textAlign: 'center', padding: '60px 20px' },
  heroTitle: { margin: '0 0 12px', fontSize: 36, fontWeight: 800 },
  heroSub: { margin: 0, fontSize: 18, color: '#aaa' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px' },
  filters: { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  filterBtn: { padding: '8px 20px', border: '1px solid #ddd', borderRadius: 20,
    background: '#fff', cursor: 'pointer', fontSize: 13, color: '#555' },
  filterActive: { background: '#e94560', color: '#fff', border: '1px solid #e94560', fontWeight: 600 },
  count: { color: '#666', marginBottom: 20, fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 },
  error: { background: '#fff0f0', border: '1px solid #fcc', color: '#c0392b',
    padding: 20, borderRadius: 10, textAlign: 'center' },
  empty: { textAlign: 'center', padding: 60, color: '#888', fontSize: 18 },
};

export default HomePage;
