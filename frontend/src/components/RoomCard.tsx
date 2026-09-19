import React from 'react';
import { Room } from '../types';
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const navigate = useNavigate();

  const typeLabel: Record<string, string> = {
    SINGLE: 'Phòng đơn', DOUBLE: 'Phòng đôi',
    SUITE: 'Suite', DELUXE: 'Deluxe',
  };

  return (
    <div style={styles.card}>
      <div style={styles.imgBox}>
        {room.imageUrl
          ? <img src={room.imageUrl} alt={room.name} style={styles.img} />
          : <div style={styles.placeholder}>🛏️</div>}
        <span style={{ ...styles.badge, background: room.isAvailable ? '#27ae60' : '#e74c3c' }}>
          {room.isAvailable ? 'Còn phòng' : 'Hết phòng'}
        </span>
      </div>
      <div style={styles.body}>
        <h3 style={styles.name}>{room.name}</h3>
        <p style={styles.type}>🏷️ {typeLabel[room.type] || room.type} — Tầng {room.floor}</p>
        <p style={styles.desc}>{room.description || 'Phòng tiện nghi, đầy đủ trang thiết bị.'}</p>
        <div style={styles.footer}>
          <span style={styles.price}>
            {Number(room.pricePerNight).toLocaleString('vi-VN')}đ<small>/đêm</small>
          </span>
          <button
            style={{ ...styles.btn, opacity: room.isAvailable ? 1 : 0.5 }}
            disabled={!room.isAvailable}
            onClick={() => navigate(`/rooms/${room.id}`)}
          >
            {room.isAvailable ? 'Xem chi tiết' : 'Hết phòng'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#fff', borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: 'transform .2s',
    display: 'flex', flexDirection: 'column' },
  imgBox: { position: 'relative', height: 180, background: '#f0f0f0' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', fontSize: 64 },
  badge: { position: 'absolute', top: 10, right: 10, color: '#fff',
    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  body: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  name: { margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a2e' },
  type: { margin: 0, fontSize: 13, color: '#666' },
  desc: { margin: 0, fontSize: 13, color: '#888', lineHeight: 1.5, flex: 1 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 20, fontWeight: 700, color: '#e94560' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '8px 18px',
    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
};

export default RoomCard;
