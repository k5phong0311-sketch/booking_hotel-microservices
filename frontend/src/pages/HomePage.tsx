import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    ALL: 'Tất Cả', SINGLE: 'Phòng Đơn', DOUBLE: 'Phòng Đôi', SUITE: 'Suite Thượng Hạng', DELUXE: 'Phòng Deluxe'
  };

  const filtered = filter === 'ALL' ? rooms : rooms.filter(r => r.type === filter);

  return (
    <div style={styles.page}>
      {/* Hero Banner Luxury */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroEyebrow}>LUXUS INTERIOR & HOTEL</div>
          <h1 style={styles.heroTitle}>KIẾN TẠO<br/>KHÔNG GIAN<br/>VƯỢT TRỘI</h1>
          <p style={styles.heroSub}>Trải nghiệm không gian sống tinh tế, đẳng cấp và trường tồn cùng thời gian.</p>
          <div style={styles.heroActions}>
            <a href="#rooms" style={styles.btnGoldFill}>Khám phá phòng nghỉ</a>
            <a href="#about" style={styles.btnGoldOutline}>Trải nghiệm 360°</a>
          </div>
        </div>
      </div>

      <div id="rooms" style={styles.container}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>KHÔNG GIAN NGHỈ DƯỠNG</h2>
          <div style={styles.divider}></div>
        </div>

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
            <p style={styles.count}>Tìm thấy <strong style={{color: '#c5a059'}}>{filtered.length}</strong> không gian phù hợp</p>
            {filtered.length === 0
              ? <div style={styles.empty}>Không có phòng nào phù hợp với lựa chọn của quý khách.</div>
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
  page: { background: '#0b0c10', minHeight: '100vh', color: '#e0e0e0' },
  hero: { 
    position: 'relative',
    height: '90vh',
    minHeight: '600px',
    backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-c6a4d45c30c2?q=80&w=2000&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(90deg, rgba(11,12,16,0.9) 0%, rgba(11,12,16,0.4) 100%)',
    zIndex: 1
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 40px',
    width: '100%'
  },
  heroEyebrow: {
    color: '#c5a059',
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '3px',
    marginBottom: 20,
    textTransform: 'uppercase'
  },
  heroTitle: { 
    margin: '0 0 24px', 
    fontSize: 64, 
    fontWeight: 700, 
    lineHeight: 1.1,
    color: '#fff',
    letterSpacing: '2px'
  },
  heroSub: { 
    margin: '0 0 40px', 
    fontSize: 18, 
    color: '#ccc',
    maxWidth: '500px',
    lineHeight: 1.6
  },
  heroActions: {
    display: 'flex',
    gap: 20
  },
  btnGoldFill: {
    background: '#c5a059',
    color: '#0b0c10',
    padding: '16px 32px',
    fontSize: 14,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textDecoration: 'none',
    transition: 'all 0.3s'
  },
  btnGoldOutline: {
    background: 'transparent',
    border: '1px solid #c5a059',
    color: '#c5a059',
    padding: '16px 32px',
    fontSize: 14,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textDecoration: 'none',
    transition: 'all 0.3s'
  },
  container: { maxWidth: 1200, margin: '0 auto', padding: '80px 20px' },
  sectionHeader: { textAlign: 'center', marginBottom: 60 },
  sectionTitle: { fontSize: 32, fontWeight: 600, letterSpacing: '2px', margin: '0 0 16px' },
  divider: { width: 60, height: 2, background: '#c5a059', margin: '0 auto' },
  filters: { display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' },
  filterBtn: { 
    padding: '10px 24px', 
    border: '1px solid #333', 
    background: 'transparent', 
    cursor: 'pointer', 
    fontSize: 13, 
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s'
  },
  filterActive: { 
    background: '#c5a059', 
    color: '#0b0c10', 
    border: '1px solid #c5a059', 
    fontWeight: 600 
  },
  count: { color: '#888', marginBottom: 30, fontSize: 15, textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 },
  error: { background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', color: '#e74c3c',
    padding: 20, textAlign: 'center' },
  empty: { textAlign: 'center', padding: 80, color: '#666', fontSize: 16, fontStyle: 'italic' },
};

export default HomePage;
