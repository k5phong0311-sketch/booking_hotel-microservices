import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const mockRevenueData = [
  { name: 'T2', revenue: 4000000, bookings: 4 },
  { name: 'T3', revenue: 3000000, bookings: 3 },
  { name: 'T4', revenue: 5000000, bookings: 5 },
  { name: 'T5', revenue: 2000000, bookings: 2 },
  { name: 'T6', revenue: 8000000, bookings: 8 },
  { name: 'T7', revenue: 12000000, bookings: 12 },
  { name: 'CN', revenue: 10000000, bookings: 10 },
];

const AdminDashboardPage: React.FC = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValue, setVoucherValue] = useState(20);
  const [quantity, setQuantity] = useState(50);
  const [statusMsg, setStatusMsg] = useState('');

  const handleBroadcastVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Đang phát hành Voucher...');
    setTimeout(() => {
      setStatusMsg(`Đã phát hành thành công ${quantity} mã ${voucherCode} (-${voucherValue}%) cho tất cả khách hàng!`);
      setVoucherCode('');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10 border-b border-gray-200 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bảng điều khiển</h1>
          <p className="text-gray-500">Tổng quan hoạt động kinh doanh khách sạn</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Doanh thu tuần này</p>
          <p className="text-3xl font-bold text-brand-DEFAULT">44,000,000đ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Biểu đồ (Chiếm 2 phần) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Biểu đồ doanh thu */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Doanh thu 7 ngày qua (VND)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                  <Bar dataKey="revenue" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biểu đồ số lượng booking */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Số lượng Đơn đặt phòng</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cột phải: Form Broadcast Voucher */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-DEFAULT/20 bg-brand-light/30 sticky top-28">
            <h3 className="text-xl font-bold text-brand-dark mb-2">Chiến dịch Marketing</h3>
            <p className="text-sm text-gray-600 mb-6">Phát hành Voucher giảm giá đồng loạt cho tất cả người dùng.</p>
            
            <form onSubmit={handleBroadcastVoucher} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mã Voucher</label>
                <input 
                  type="text" 
                  required
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="VD: SUMMER2026"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/50 outline-none uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mức giảm (%)</label>
                  <input 
                    type="number" 
                    min="1" max="100"
                    required
                    value={voucherValue}
                    onChange={e => setVoucherValue(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT/50 outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-brand-dark text-white rounded-lg font-bold hover:bg-brand-DEFAULT transition-all shadow-md mt-4"
              >
                PHÁT HÀNH VOUCHER (BROADCAST)
              </button>
            </form>

            {statusMsg && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
                {statusMsg}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
