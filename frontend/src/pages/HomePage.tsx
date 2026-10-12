import React, { useEffect, useState } from 'react';
import { roomService } from '../services/room.service';
import { Room } from '../types';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingSlideOver from '../components/BookingSlideOver';

const HomePage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [priceRange, setPriceRange] = useState<'ALL' | 'UNDER_1M' | '1M_2M' | 'OVER_2M'>('ALL');
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const loadRoomsByPrice = (range: 'ALL' | 'UNDER_1M' | '1M_2M' | 'OVER_2M') => {
    setPriceRange(range);
    setLoading(true);
    setError('');
    let promise: Promise<Room[]>;
    if (range === 'UNDER_1M') {
      promise = roomService.getByPriceRange(0, 1000000);
    } else if (range === '1M_2M') {
      promise = roomService.getByPriceRange(1000000, 2000000);
    } else if (range === 'OVER_2M') {
      promise = roomService.getByPriceRange(2000001, 99999999);
    } else {
      promise = roomService.getAll();
    }
    promise
      .then(data => setRooms(data))
      .catch(() => setError('Lỗi kết nối đến máy chủ.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoomsByPrice('ALL');
  }, []);

  const types = ['ALL', 'SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'];
  const typeLabel: Record<string, string> = {
    ALL: 'Tất Cả', SINGLE: 'Phòng Đơn', DOUBLE: 'Phòng Đôi', SUITE: 'Suite Thượng Hạng', DELUXE: 'Phòng Deluxe'
  };

  const priceOptions: { key: 'ALL' | 'UNDER_1M' | '1M_2M' | 'OVER_2M'; label: string }[] = [
    { key: 'ALL', label: 'Mọi mức giá' },
    { key: 'UNDER_1M', label: 'Dưới 1.000.000đ' },
    { key: '1M_2M', label: '1.000.000đ - 2.000.000đ' },
    { key: 'OVER_2M', label: 'Trên 2.000.000đ' },
  ];

  const filtered = filter === 'ALL' ? rooms : rooms.filter(r => r.type === filter);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-brand-light/10"></div>
        
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
          
          {/* Filters by Type */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  filter === t 
                    ? 'bg-brand-dark text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-brand-light/50 border border-gray-200'
                }`}
              >
                {typeLabel[t]}
              </button>
            ))}
          </div>

          {/* Filters by Price Range (GET /api/rooms/price) */}
          <div className="flex flex-wrap justify-center items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">💰 Lọc theo giá:</span>
            {priceOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => loadRoomsByPrice(opt.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  priceRange === opt.key
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
                }`}
              >
                {opt.label}
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
                  <RoomCard key={room.id} room={room} onBook={() => setSelectedRoom(room)} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Slide-over Booking Component */}
      <BookingSlideOver isOpen={!!selectedRoom} room={selectedRoom} onClose={() => setSelectedRoom(null)} />
    </div>
  );
};

export default HomePage;
