import React, { useEffect, useState } from 'react';
import { roomService } from '../services/room.service';
import { Room } from '../types';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingSlideOver from '../components/BookingSlideOver'; // Component mới sẽ tạo sau

const HomePage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  
  // State quản lý Slide-over
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    roomService.getAll()
      .then(data => setRooms(data))
      .catch(() => setError('Lỗi kết nối đến máy chủ.'))
      .finally(() => setLoading(false));
  }, []);

  const types = ['ALL', 'SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'];
  const typeLabel: Record<string, string> = {
    ALL: 'Tất Cả', SINGLE: 'Phòng Đơn', DOUBLE: 'Phòng Đôi', SUITE: 'Suite Thượng Hạng', DELUXE: 'Phòng Deluxe'
  };

  const filtered = filter === 'ALL' ? rooms : rooms.filter(r => r.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Banner - Bright & Airy */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center bg-gray-100 overflow-hidden">
        {/* Background Image with Light Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2000&auto=format&fit=crop")' }}
        ></div>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl px-6 mt-16">
          <span className="block text-brand-dark font-semibold tracking-[4px] uppercase text-sm mb-6">ĐẶT PHÒNG KHÁCH SẠN TRỰC TUYẾN</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-tight mb-8 drop-shadow-sm">
            Trải nghiệm lưu trú <br className="hidden md:block" />
            <span className="text-brand-dark">hoàn hảo</span> cho kỳ nghỉ của bạn.
          </h1>
          <p className="text-lg md:text-xl text-gray-800 font-medium max-w-2xl mx-auto mb-10">
            Hàng ngàn lựa chọn phòng nghỉ tiện nghi, giá tốt và dịch vụ chăm sóc khách hàng 24/7.
          </p>
          <a href="#discover" className="inline-block bg-brand-dark text-white font-medium px-8 py-4 rounded hover:bg-brand-DEFAULT transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Xem phòng trống ngay
          </a>
        </div>
      </section>

      {/* Discovery Section */}
      <section id="discover" className="max-w-7xl mx-auto px-6 pt-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Danh Sách Phòng Nghỉ</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-8 rounded"></div>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {types.map(t => (
              <button 
                key={t} 
                onClick={() => setFilter(t)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  filter === t 
                  ? 'bg-brand-dark text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {typeLabel[t]}
              </button>
            ))}
          </div>
        </div>

        {loading && <LoadingSpinner text="Đang tải danh sách phòng..." />}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center max-w-2xl mx-auto border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="text-gray-500 mb-8 font-medium">
              Tìm thấy <span className="text-brand-dark font-bold">{filtered.length}</span> không gian phù hợp
            </p>
            
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
                Không có phòng nào phù hợp với lựa chọn của quý khách.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map(room => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    onBook={() => setSelectedRoom(room)} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Slide-over Booking Component */}
      {selectedRoom && (
        <BookingSlideOver 
          room={selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
        />
      )}
    </div>
  );
};

export default HomePage;
