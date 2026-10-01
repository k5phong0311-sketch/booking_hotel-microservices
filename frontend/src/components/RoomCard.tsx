import React from 'react';
import { Room } from '../types';
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
  onBook?: () => void; // Prop mới để gọi Slide-over
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onBook }) => {
  const navigate = useNavigate();

  const typeLabel: Record<string, string> = {
    SINGLE: 'Phòng Đơn', DOUBLE: 'Phòng Đôi',
    SUITE: 'Suite Thượng Hạng', DELUXE: 'Phòng Deluxe',
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        {room.imageUrl ? (
          <img 
            src={room.imageUrl} 
            alt={room.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-serif text-2xl tracking-widest">
            LUXUS
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm text-white ${
            room.isAvailable ? 'bg-accent-dark/90 backdrop-blur-sm' : 'bg-red-500/90 backdrop-blur-sm'
          }`}>
            {room.isAvailable ? 'Có Sẵn' : 'Đã Kín'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-brand-DEFAULT text-xs font-bold tracking-wider uppercase mb-1 block">
              {typeLabel[room.type] || room.type} • Tầng {room.floor}
            </span>
            <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-brand-dark transition-colors">
              {room.name}
            </h3>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
          {room.description || 'Không gian nghỉ dưỡng tinh tế, tràn ngập ánh sáng tự nhiên với đầy đủ tiện nghi hiện đại.'}
        </p>

        {/* Footer / Actions */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Giá từ</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900">
                {Number(room.pricePerNight).toLocaleString('vi-VN')}
              </span>
              <span className="text-sm font-medium text-gray-500">VNĐ/đêm</span>
            </div>
          </div>
          
          <button
            disabled={!room.isAvailable}
            onClick={() => {
              if (onBook) onBook();
              else navigate(`/rooms/${room.id}`); // Fallback
            }}
            className={`px-5 py-2.5 rounded text-sm font-semibold tracking-wide transition-all ${
              room.isAvailable 
                ? 'bg-brand-dark text-white hover:bg-brand-DEFAULT hover:shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {room.isAvailable ? 'ĐẶT NGAY' : 'HẾT PHÒNG'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
