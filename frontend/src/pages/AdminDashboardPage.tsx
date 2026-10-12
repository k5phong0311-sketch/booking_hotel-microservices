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

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'bookings' | 'users' | 'chat'>('overview');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
      const [roomsData, bookingsData, usersData] = await Promise.all([
        roomService.getAll().catch(() => []),
        bookingService.getAllBookings().catch(() => []),
        userService.getAll().catch(() => []),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
      setUsers(usersData);
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
    } catch (err: any) {
      setStatusMsg(err.response?.data?.message || 'Không thể phát hành mã giảm giá (có thể mã đã tồn tại).');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Bảng Điều Khiển Quản Trị</h1>
          <p className="text-gray-500">Quản lý phòng, đơn đặt, người dùng và hỗ trợ khách hàng.</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <button onClick={() => setActiveTab('overview')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'overview' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Tổng quan</button>
        <button onClick={() => setActiveTab('rooms')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'rooms' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Phòng</button>
        <button onClick={() => setActiveTab('bookings')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'bookings' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Đơn đặt</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'users' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Người dùng</button>
        <button onClick={() => setActiveTab('chat')} className={`px-6 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'chat' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Hỗ trợ (Chat)</button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-DEFAULT/20 bg-brand-light/30">
              <h3 className="text-xl font-bold text-brand-dark mb-2">Chiến dịch Marketing</h3>
              <form onSubmit={handleBroadcastVoucher} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mã giảm giá</label>
                  <input type="text" required value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none uppercase font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Giảm giá (%)</label>
                    <input type="number" required value={voucherValue} onChange={e => setVoucherValue(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng</label>
                    <input type="number" required value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-brand-dark text-white rounded-lg font-bold mt-4">Phát hành</button>
              </form>
              {statusMsg && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{statusMsg}</div>}
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {b.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex space-x-2">
                    {b.status === 'PENDING' && (
                      <button onClick={() => handleConfirmBooking(b.id)} className="text-green-600 font-bold text-sm">Xác nhận</button>
                    )}
                    {b.status !== 'CANCELED' && (
                      <button onClick={() => handleCancelBooking(b.id)} className="text-red-600 font-bold text-sm">Hủy</button>
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
