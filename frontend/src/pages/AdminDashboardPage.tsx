import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/room.service';
import { bookingService } from '../services/booking.service';
import { userService } from '../services/user.service';
import api from '../services/api';
import { Room, Booking, User } from '../types';

const initialRevenueData = [
  { name: 'Mon', revenue: 4000000 },
  { name: 'Tue', revenue: 3000000 },
  { name: 'Wed', revenue: 5000000 },
  { name: 'Thu', revenue: 2780000 },
  { name: 'Fri', revenue: 8900000 },
  { name: 'Sat', revenue: 12000000 },
  { name: 'Sun', revenue: 9500000 },
];

interface VoucherAdminItem {
  id: number;
  code: string;
  discountPercentage: number;
  quantity: number;
  usedCount: number;
}

interface PaymentAdminItem {
  id: number;
  bookingId: number;
  userId: number;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  refundAmount?: number;
  createdAt: string;
}

interface PaymentStatsSummary {
  totalTransactions: number;
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
  byStatus: Record<string, number>;
}

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'bookings' | 'payments' | 'users' | 'chat'>('overview');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vouchers, setVouchers] = useState<VoucherAdminItem[]>([]);
  const [payments, setPayments] = useState<PaymentAdminItem[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStatsSummary | null>(null);
  const [revenueData] = useState<{name: string, revenue: number}[]>(initialRevenueData);

  // Room Management State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<Room>>({});
  
  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValue, setVoucherValue] = useState(10);
  const [quantity, setQuantity] = useState(50);
  const [statusMsg, setStatusMsg] = useState('');

  // Chat State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatMessages, setChatMessages] = useState<{ id: number, sender: string, text: string, time: Date, senderId?: string }[]>([]);
  const [activeChatTarget, setActiveChatTarget] = useState<string>('broadcast');
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat' && !socket) {
      const newSocket = io('http://localhost:3000/chat', { query: { role: 'admin' } });
      setSocket(newSocket);
      
      newSocket.on('userMessage', (data: { senderId: string, message: string, timestamp: string }) => {
        setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: data.message, time: new Date(data.timestamp), senderId: data.senderId }]);
        if (data.senderId) setActiveChatTarget(data.senderId);
      });
      return () => { newSocket.close(); };
    }
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchData = async () => {
    try {
      const [roomsData, bookingsData, usersData, vouchersRes, paymentsRes, statsRes] = await Promise.all([
        roomService.getAll().catch(() => []),
        bookingService.getAllBookings().catch(() => []),
        userService.getAll().catch(() => []),
        api.get<VoucherAdminItem[]>('/vouchers').catch(() => ({ data: [] })),
        api.get<{ data: PaymentAdminItem[] }>('/payments?limit=50').catch(() => ({ data: { data: [] } })),
        api.get<PaymentStatsSummary>('/payments/stats/summary').catch(() => ({ data: null })),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
      setUsers(usersData);
      setVouchers(Array.isArray(vouchersRes.data) ? vouchersRes.data : []);
      setPayments(paymentsRes.data?.data || []);
      if (statsRes.data) setPaymentStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vouchers/broadcast', {
        code: voucherCode.trim().toUpperCase(),
        discount: Number(voucherValue),
        quantity: Number(quantity),
      });
      setStatusMsg(`Đã phát hành mã ${voucherCode.toUpperCase()} (-${voucherValue}%). Số lượng: ${quantity}`);
      setVoucherCode('');
      fetchData();
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'Không thể phát hành mã giảm giá.');
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (!confirm('Bạn muốn xóa mã giảm giá này?')) return;
    try {
      await api.delete(`/vouchers/${id}`);
      fetchData();
    } catch {
      alert('Không thể xóa mã giảm giá');
    }
  };

  const handleRefundPayment = async (payment: PaymentAdminItem) => {
    const reason = prompt('Nhập lý do hoàn tiền:', 'Khách yêu cầu hủy phòng / Hoàn tiền theo chính sách');
    if (reason === null) return;
    try {
      await api.post(`/payments/${payment.id}/refund`, { reason });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hoàn tiền giao dịch');
    }
  };

  const handleCancelPayment = async (payment: PaymentAdminItem) => {
    if (!confirm(`Hủy giao dịch thanh toán #${payment.id}?`)) return;
    try {
      await api.post(`/payments/${payment.id}/cancel`, { reason: 'Admin hủy giao dịch chờ' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy giao dịch');
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'admin', text: chatInput, time: new Date() }]);
    socket.emit('adminReply', { clientId: activeChatTarget, message: chatInput });
    setChatInput('');
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom.id) {
        await roomService.updateRoom(editingRoom.id, editingRoom);
      } else {
        await roomService.createRoom(editingRoom);
      }
      setShowRoomModal(false);
      setEditingRoom({});
      fetchData();
    } catch (err) {
      alert('Đã xảy ra lỗi khi lưu phòng');
    }
  };

  const handleToggleRoomAvailability = async (id: number) => {
    try {
      await roomService.toggleAvailability(id);
      fetchData();
    } catch {
      alert('Không thể đổi trạng thái phòng');
    }
  };

  const handleToggleUserRole = async (u: User) => {
    const newRole = u.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    try {
      await userService.updateRole(u.id, newRole);
      fetchData();
    } catch {
      alert('Không thể cập nhật quyền người dùng');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await userService.deleteUser(id);
      fetchData();
    } catch {
      alert('Không thể xóa người dùng');
    }
  };

  const handleConfirmBooking = async (id: number) => {
    try {
      await bookingService.updateStatus(id, 'CONFIRMED');
      fetchData();
    } catch(err) {
      alert('Đã xảy ra lỗi');
    }
  };

  const handleCancelBooking = async (id: number) => {
    if(confirm('Bạn muốn hủy đơn này?')) {
      try {
        await bookingService.cancel(id);
        fetchData();
      } catch(err) {
        alert('Đã xảy ra lỗi');
      }
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      await roomService.deleteRoom(id);
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Bảng Điều Khiển Quản Trị</h1>
          <p className="text-gray-500">Quản lý phòng, đơn đặt, giao dịch thanh toán, voucher, người dùng và hỗ trợ khách hàng.</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <button onClick={() => setActiveTab('overview')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'overview' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Tổng quan & Voucher</button>
        <button onClick={() => setActiveTab('rooms')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'rooms' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Phòng ({rooms.length})</button>
        <button onClick={() => setActiveTab('bookings')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'bookings' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Đơn đặt ({bookings.length})</button>
        <button onClick={() => setActiveTab('payments')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'payments' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Thanh toán ({payments.length})</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'users' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Người dùng ({users.length})</button>
        <button onClick={() => setActiveTab('chat')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'chat' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Hỗ trợ (Chat)</button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards từ GET /api/payments/stats/summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Doanh thu thực nhận</p>
              <p className="text-2xl font-bold text-brand-dark">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentStats?.netRevenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tổng thu: {(paymentStats?.totalRevenue || 0).toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Giao dịch thành công</p>
              <p className="text-2xl font-bold text-green-600">{paymentStats?.byStatus?.SUCCESS || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Trên tổng {paymentStats?.totalTransactions || 0} giao dịch</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Đang chờ thanh toán</p>
              <p className="text-2xl font-bold text-amber-500">{paymentStats?.byStatus?.PENDING || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Tổng số đơn đặt: {bookings.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Đã hoàn tiền (Refund)</p>
              <p className="text-2xl font-bold text-red-500">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentStats?.totalRefunded || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{paymentStats?.byStatus?.REFUNDED || 0} giao dịch hoàn tiền</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Doanh thu 7 ngày</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                      <Bar dataKey="revenue" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Danh sách Mã giảm giá đã phát hành */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🏷️ Danh sách Mã giảm giá đang hoạt động ({vouchers.length})</h3>
                {vouchers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Chưa có mã giảm giá nào. Hãy phát hành mã ở khung bên phải.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 font-bold text-gray-700">Mã Voucher</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Mức giảm</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Đã dùng / Tổng</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Còn lại</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {vouchers.map(v => (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono font-bold text-brand-dark">{v.code}</td>
                            <td className="px-4 py-3 font-bold text-green-600">-{v.discountPercentage}%</td>
                            <td className="px-4 py-3">{v.usedCount} / {v.quantity}</td>
                            <td className="px-4 py-3 font-semibold">{Math.max(0, v.quantity - v.usedCount)}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDeleteVoucher(v.id)}
                                className="text-red-500 hover:underline font-bold text-xs cursor-pointer"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-DEFAULT/20 bg-brand-light/30">
                <h3 className="text-xl font-bold text-brand-dark mb-2">Chiến dịch Marketing</h3>
                <p className="text-xs text-gray-500 mb-4">Phát hành hoặc cập nhật mã giảm giá cho khách đặt phòng.</p>
                <form onSubmit={handleBroadcastVoucher} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mã giảm giá</label>
                    <input type="text" required placeholder="VD: SUMMER20" value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none uppercase font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Giảm giá (%)</label>
                      <input type="number" min={1} max={100} required value={voucherValue} onChange={e => setVoucherValue(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng</label>
                      <input type="number" min={1} required value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-brand-dark text-white rounded-lg font-bold mt-4 cursor-pointer">Phát hành</button>
                </form>
                {statusMsg && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{statusMsg}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Danh sách phòng</h2>
            <button onClick={() => { setEditingRoom({}); setShowRoomModal(true); }} className="bg-brand-DEFAULT text-white px-4 py-2 rounded-lg font-bold text-sm">+ Thêm phòng</button>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900">Hình ảnh</th>
                <th className="px-6 py-4 font-bold text-gray-900">Tên phòng</th>
                <th className="px-6 py-4 font-bold text-gray-900">Loại</th>
                <th className="px-6 py-4 font-bold text-gray-900">Giá/Ngày</th>
                <th className="px-6 py-4 font-bold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-gray-900">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><img src={room.imageUrl} alt={room.name} className="w-20 h-14 object-cover rounded-md" /></td>
                  <td className="px-6 py-4 font-bold text-gray-900">{room.name}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold">{room.type}</span></td>
                  <td className="px-6 py-4 text-brand-DEFAULT font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.pricePerNight)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleRoomAvailability(room.id)}
                      title="Nhấn để đổi trạng thái phòng"
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition ${room.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      {room.isAvailable ? 'Còn trống' : 'Đã đặt'}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex space-x-3">
                    <button onClick={() => { setEditingRoom(room); setShowRoomModal(true); }} className="text-blue-600 hover:underline font-bold text-sm">Sửa</button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="text-red-600 hover:underline font-bold text-sm">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold mb-6">{editingRoom.id ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h2>
            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Tên phòng</label>
                  <input type="text" required className="w-full border p-2 rounded-lg" value={editingRoom.name || ''} onChange={e => setEditingRoom({...editingRoom, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Loại</label>
                  <select required className="w-full border p-2 rounded-lg" value={editingRoom.type || 'SINGLE'} onChange={e => setEditingRoom({...editingRoom, type: e.target.value as any})}>
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double</option>
                    <option value="DELUXE">Deluxe</option>
                    <option value="SUITE">Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Giá mỗi đêm (VNĐ)</label>
                  <input type="number" required className="w-full border p-2 rounded-lg" value={editingRoom.pricePerNight || ''} onChange={e => setEditingRoom({...editingRoom, pricePerNight: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Tầng</label>
                  <input type="number" required className="w-full border p-2 rounded-lg" value={editingRoom.floor || 1} onChange={e => setEditingRoom({...editingRoom, floor: Number(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">Link Ảnh</label>
                  <input type="text" required className="w-full border p-2 rounded-lg" value={editingRoom.imageUrl || ''} onChange={e => setEditingRoom({...editingRoom, imageUrl: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">Mô tả</label>
                  <textarea rows={3} required className="w-full border p-2 rounded-lg" value={editingRoom.description || ''} onChange={e => setEditingRoom({...editingRoom, description: e.target.value})}></textarea>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={editingRoom.isAvailable !== false} onChange={e => setEditingRoom({...editingRoom, isAvailable: e.target.checked})} />
                    <span className="font-bold text-sm">Còn trống</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button type="button" onClick={() => setShowRoomModal(false)} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-brand-dark text-white font-bold rounded-lg">Lưu phòng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900">ID</th>
                <th className="px-6 py-4 font-bold text-gray-900">ID Khách</th>
                <th className="px-6 py-4 font-bold text-gray-900">ID Phòng</th>
                <th className="px-6 py-4 font-bold text-gray-900">Ngày đặt</th>
                <th className="px-6 py-4 font-bold text-gray-900">Tổng tiền</th>
                <th className="px-6 py-4 font-bold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-gray-900">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{b.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{b.userId}</td>
                  <td className="px-6 py-4">Room {b.roomId}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(b.checkIn).toLocaleDateString('vi-VN')} - {new Date(b.checkOut).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-brand-DEFAULT font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : (String(b.status) === 'CANCELED' || String(b.status) === 'CANCELLED') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {b.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex space-x-2">
                    {b.status === 'PENDING' && (
                      <button onClick={() => handleConfirmBooking(b.id)} className="text-green-600 font-bold text-sm cursor-pointer">Xác nhận</button>
                    )}
                    {String(b.status) !== 'CANCELED' && String(b.status) !== 'CANCELLED' && (
                      <button onClick={() => handleCancelBooking(b.id)} className="text-red-600 font-bold text-sm cursor-pointer">Hủy</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900">ID</th>
                <th className="px-6 py-4 font-bold text-gray-900">Booking</th>
                <th className="px-6 py-4 font-bold text-gray-900">Khách hàng</th>
                <th className="px-6 py-4 font-bold text-gray-900">Số tiền</th>
                <th className="px-6 py-4 font-bold text-gray-900">Phương thức</th>
                <th className="px-6 py-4 font-bold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-gray-900">Thời gian</th>
                <th className="px-6 py-4 font-bold text-gray-900">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{p.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">Đơn #{p.bookingId}</td>
                  <td className="px-6 py-4">User #{p.userId}</td>
                  <td className="px-6 py-4 text-brand-DEFAULT font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(p.amount))}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-bold">{p.method}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                      p.status === 'REFUNDED' ? 'bg-purple-100 text-purple-700' :
                      p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td className="px-6 py-4 flex space-x-3">
                    {p.status === 'SUCCESS' && (
                      <button
                        onClick={() => handleRefundPayment(p)}
                        className="text-purple-600 hover:underline font-bold text-sm cursor-pointer"
                      >
                        Hoàn tiền (Refund)
                      </button>
                    )}
                    {p.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelPayment(p)}
                        className="text-red-600 hover:underline font-bold text-sm cursor-pointer"
                      >
                        Hủy giao dịch
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900">ID</th>
                <th className="px-6 py-4 font-bold text-gray-900">Tên người dùng</th>
                <th className="px-6 py-4 font-bold text-gray-900">Email</th>
                <th className="px-6 py-4 font-bold text-gray-900">Vai trò</th>
                <th className="px-6 py-4 font-bold text-gray-900">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{u.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{u.fullName}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex space-x-3">
                    <button
                      onClick={() => handleToggleUserRole(u)}
                      className="text-blue-600 hover:underline font-bold text-sm"
                    >
                      Đổi quyền ({u.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'})
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-red-600 hover:underline font-bold text-sm"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-[600px] overflow-hidden">
          <div className="w-1/3 border-r border-gray-100 p-4 bg-gray-50">
            <h3 className="font-bold text-gray-900 mb-4">Khách hàng</h3>
            <div className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-brand-DEFAULT cursor-pointer">
              <p className="font-bold text-sm">Tất cả tin nhắn</p>
              <p className="text-xs text-gray-500 mt-1">Hỗ trợ chung</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col max-w-[70%] ${msg.sender === 'admin' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <span className="text-[10px] text-gray-400 mb-1">{msg.sender === 'admin' ? 'Admin' : 'Khách'}</span>
                  <div className={`px-4 py-2 rounded-xl text-sm ${msg.sender === 'admin' ? 'bg-brand-DEFAULT text-white rounded-tr-none' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Nhập tin nhắn phản hồi..." className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              <button type="submit" className="px-6 py-2 bg-brand-dark text-white font-bold rounded-lg">Gửi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboardPage;
