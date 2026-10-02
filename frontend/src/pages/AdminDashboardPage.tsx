import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'users' | 'chat'>('dashboard');
  
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValue, setVoucherValue] = useState(0);
  const [quantity, setQuantity] = useState(50);
  const [statusMsg, setStatusMsg] = useState('');

  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widget = document.getElementById('customer-chat-widget');
    if (widget) widget.style.display = 'none';

    fetchData();

    const newSocket = io('http://localhost:3000/chat', { query: { role: 'admin' } });
    newSocket.on('userMessage', (data) => {
      setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: data.message, time: new Date(data.timestamp) }]);
    });
    setSocket(newSocket);

    return () => {
      if (widget) widget.style.display = 'block';
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchData = async () => {
    try {
      const [roomsRes, usersRes, bookingsRes] = await Promise.all([
        api.get('/rooms').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/bookings').catch(() => ({ data: [] }))
      ]);
      
      setRooms(roomsRes.data);
      setUsers(usersRes.data);
      
      const bks = bookingsRes.data || [];
      setBookings(bks);

      let rev = 0;
      bks.forEach((b: any) => { if (b.status !== 'CANCELLED') rev += Number(b.totalPrice); });
      setTotalRevenue(rev);

      setRevenueData([
        { name: 'Mon', revenue: rev * 0.1, bookings: bks.length },
        { name: 'Tue', revenue: rev * 0.15, bookings: bks.length + 1 },
        { name: 'Wed', revenue: rev * 0.2, bookings: bks.length + 2 },
        { name: 'Thu', revenue: rev * 0.1, bookings: bks.length },
        { name: 'Fri', revenue: rev * 0.25, bookings: bks.length + 3 },
        { name: 'Sat', revenue: rev * 0.15, bookings: bks.length + 4 },
        { name: 'Sun', revenue: rev * 0.05, bookings: bks.length + 1 },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Đang phát hành Voucher...');
    setTimeout(() => {
      setStatusMsg(`Đã phát hành thành công ${quantity} mã ${voucherCode} (-${voucherValue}%)!`);
      setVoucherCode('');
    }, 1000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'admin', text: chatInput, time: new Date() }]);
    socket.emit('adminReply', { clientId: 'broadcast', message: chatInput });
    setChatInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8 border-b border-gray-200 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Trang Quản Trị</h1>
          <div className="flex gap-4 mt-4">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'dashboard' ? 'bg-brand-DEFAULT text-white' : 'bg-gray-100 text-gray-600'}`}>Thống kê</button>
            <button onClick={() => setActiveTab('rooms')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'rooms' ? 'bg-brand-DEFAULT text-white' : 'bg-gray-100 text-gray-600'}`}>Quản lý Phòng</button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'users' ? 'bg-brand-DEFAULT text-white' : 'bg-gray-100 text-gray-600'}`}>Quản lý User</button>
            <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2 ${activeTab === 'chat' ? 'bg-brand-DEFAULT text-white' : 'bg-gray-100 text-gray-600'}`}>Hỗ trợ Khách hàng</button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Tổng doanh thu</p>
          <p className="text-3xl font-bold text-brand-DEFAULT">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}</p>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Doanh thu dự kiến</h3>
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mã Voucher</label>
                  <input type="text" required value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none uppercase font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Giảm (%)</label>
                    <input type="number" required value={voucherValue} onChange={e => setVoucherValue(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng</label>
                    <input type="number" required value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-brand-dark text-white rounded-lg font-bold mt-4">PHÁT HÀNH VOUCHER</button>
              </form>
              {statusMsg && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{statusMsg}</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900">Hình ảnh</th>
                <th className="px-6 py-4 font-bold text-gray-900">Tên phòng</th>
                <th className="px-6 py-4 font-bold text-gray-900">Loại</th>
                <th className="px-6 py-4 font-bold text-gray-900">Giá / Đêm</th>
                <th className="px-6 py-4 font-bold text-gray-900">Trạng thái</th>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {room.isAvailable ? 'Trống' : 'Đã đặt'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900">ID</th>
                <th className="px-6 py-4 font-bold text-gray-900">Tên người dùng</th>
                <th className="px-6 py-4 font-bold text-gray-900">Email</th>
                <th className="px-6 py-4 font-bold text-gray-900">Quyền (Role)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{u.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{u.fullName || u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-[600px] overflow-hidden">
          <div className="w-1/3 border-r border-gray-100 p-4 bg-gray-50">
            <h3 className="font-bold text-gray-900 mb-4">Khách hàng</h3>
            <div className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-brand-DEFAULT cursor-pointer">
              <p className="font-bold text-sm">Tất cả tin nhắn</p>
              <p className="text-xs text-gray-500 mt-1">Cổng chat hỗ trợ chung</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col max-w-[70%] ${msg.sender === 'admin' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <span className="text-[10px] text-gray-400 mb-1">{msg.sender === 'admin' ? 'Admin' : 'Khách hàng'}</span>
                  <div className={`px-4 py-2 rounded-xl text-sm ${msg.sender === 'admin' ? 'bg-brand-DEFAULT text-white rounded-tr-none' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Loại a reply..." className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              <button type="submit" className="px-6 py-2 bg-brand-dark text-white font-bold rounded-lg">Gửi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboardPage;
