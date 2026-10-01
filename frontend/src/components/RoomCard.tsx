import React from 'react';
import { Room } from '../types';
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const navigate = useNavigate();

  const typeLabel: Record<string, string> = {
    SINGLE: 'Phòng Đơn', DOUBLE: 'Phòng Đôi',
    SUITE: 'Suite Thượng Hạng', DELUXE: 'Phòng Deluxe',
  };

  return (
    <div style={styles.card}>
      <div style={styles.imgBox}>
        {room.imageUrl
          ? <img src={room.imageUrl} alt={room.name} style={styles.img} />
          : <div style={styles.placeholder}>LUXUS</div>}
        <div style={styles.overlay}></div>
        <span style={{ ...styles.badge, background: room.isAvailable ? 'rgba(39, 174, 96, 0.9)' : 'rgba(231, 76, 60, 0.9)' }}>
          {room.isAvailable ? 'Sẵn Sàng' : 'Đã Kín'}
        </span>
      </div>
      <div style={styles.body}>
        <h3 style={styles.name}>{room.name}</h3>
        <p style={styles.type}>{typeLabel[room.type] || room.type} — Tầng {room.floor}</p>
        <p style={styles.desc}>{room.description || 'Không gian nghỉ dưỡng tinh tế, trang bị nội thất cao cấp đạt chuẩn quốc tế.'}</p>
        <div style={styles.footer}>
          <div style={styles.priceWrap}>
            <span style={styles.priceLabel}>GIÁ TỪ</span>
            <span style={styles.price}>
              {Number(room.pricePerNight).toLocaleString('vi-VN')}đ
            </span>
          </div>
          <button
            style={{ ...styles.btn, opacity: room.isAvailable ? 1 : 0.5 }}
            disabled={!room.isAvailable}
            onClick={() => navigate(`/rooms/${room.id}`)}
          >
            {room.isAvailable ? 'CHI TIẾT' : 'HẾT PHÒNG'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: { 
    background: '#111217', 
    border: '1px solid #222',
    transition: 'all 0.3s ease',
    display: 'flex', 
    flexDirection: 'column',
    cursor: 'pointer'
  },
  imgBox: { position: 'relative', height: 240, background: '#0b0c10', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to top, #111217 0%, transparent 50%)',
    zIndex: 1
  },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', fontSize: 24, letterSpacing: '4px', color: '#c5a059', fontFamily: 'Montserrat' },
  badge: { position: 'absolute', top: 16, right: 16, color: '#fff',
    padding: '4px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', zIndex: 2 },
  body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 },
  name: { margin: 0, fontSize: 20, fontWeight: 600, color: '#fff', letterSpacing: '1px' },
  type: { margin: 0, fontSize: 11, color: '#c5a059', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 },
  desc: { margin: 0, fontSize: 13, color: '#888', lineHeight: 1.6, flex: 1 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 },
  priceWrap: { display: 'flex', flexDirection: 'column' },
  priceLabel: { fontSize: 10, color: '#666', letterSpacing: '1px', marginBottom: 4 },
  price: { fontSize: 18, fontWeight: 500, color: '#fff', fontFamily: 'Montserrat' },
  btn: { 
    background: 'transparent', 
    color: '#c5a059', 
    border: '1px solid #c5a059', 
    padding: '8px 20px',
    cursor: 'pointer', 
    fontWeight: 600, 
    fontSize: 12,
    letterSpacing: '1px',
    transition: 'all 0.3s'
  },
};

export default RoomCard;
