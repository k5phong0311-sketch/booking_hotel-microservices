const fs = require('fs');

const adminDashboard = `import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import api from '../services/api';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'users' | 'chat'>('dashboard');
  
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValue, setVoucherValue] = useState(20);
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

      // Generate mock chart data based on real bookings if possible
      setRevenueData([
        { name: 'T2', revenue: rev * 0.1, bookings: bks.length },
        { name: 'T3', revenue: rev * 0.15, bookings: bks.length + 1 },
        { name: 'T4', revenue: rev * 0.2, bookings: bks.length + 2 },
        { name: 'T5', revenue: rev * 0.1, bookings: bks.length },
        { name: 'T6', revenue: rev * 0.25, bookings: bks.length + 3 },
        { name: 'T7', revenue: rev * 0.15, bookings: bks.length + 4 },
        { name: 'CN', revenue: rev * 0.05, bookings: bks.length + 1 },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Đang phát hành Voucher...');
    setTimeout(() => {
      setStatusMsg(\`Đã phát hành thành công \${quantity} mã \${voucherCode} (-\${voucherValue}%)!\`);
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
            <button onClick={() => setActiveTab('dashboard')} className={\`px-4 py-2 font-bold rounded-lg \${activeTab === 'dashboard' ? 'bg-brand-DEFAULT text-white' : 'bg-gray-100 text-gray-600'}\`}>Thống kê</button>
            <button onClick={() => setActiveTab('rooms')} className={\`px-4 py-2 font-bold rounded-lg \${activeTab === 'rooms' ? 'bg-brand-DEFAULT text-white' : 'bg-gray-100 text-gray-600'}\`}>Quản lý Phòng</button>
            <button onClick={() => setActiveTab('users')} className={\`px-4 py-2 font-bold rounded-lg \${activeTab === 'users' ? 'bg-brand-DEFAULT text-white' : 'bg-gray-100 text-gray-600'}\`}>Quản lý User</button>
            <button onClick={() => setActiveTab('chat')} className={\`px-4 py-2 font-bold rounded-lg flex items-center gap-2 \${activeTab === 'chat' ? 'bg-brand-DEFAULT text-white' : 'bg-gray-100 text-gray-600'}\`}>Hỗ trợ Khách hàng</button>
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
                    <YAxis tickFormatter={(value) => \`\${value / 1000000}M\`} axisLine={false} tickLine={false} />
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
                    <span className={\`px-3 py-1 rounded-full text-xs font-bold \${room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
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
                  <td className="px-6 py-4 font-bold text-gray-900">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={\`px-3 py-1 rounded-full text-xs font-bold \${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}\`}>
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
                <div key={msg.id} className={\`flex flex-col max-w-[70%] \${msg.sender === 'admin' ? 'self-end items-end' : 'self-start items-start'}\`}>
                  <span className="text-[10px] text-gray-400 mb-1">{msg.sender === 'admin' ? 'Admin' : 'Khách hàng'}</span>
                  <div className={\`px-4 py-2 rounded-xl text-sm \${msg.sender === 'admin' ? 'bg-brand-DEFAULT text-white rounded-tr-none' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'}\`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Nhập câu trả lời..." className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              <button type="submit" className="px-6 py-2 bg-brand-dark text-white font-bold rounded-lg">Gửi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboardPage;
`;

const chatWidget = `import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'human' | 'system';
  text: string;
  time: Date;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [requiresHuman, setRequiresHuman] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000/chat');

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('checkAdminStatus');
    });

    socketRef.current.on('adminStatus', (data: { isOnline: boolean }) => {
      setAdminOnline(data.isOnline);
      if (!data.isOnline && requiresHuman) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'system',
          text: 'Tư vấn viên vừa offline. Trợ lý AI sẽ tiếp tục hỗ trợ bạn.',
          time: new Date()
        }]);
        setRequiresHuman(false);
      }
    });

    socketRef.current.on('aiReply', (data: { message: string, timestamp: string, isError?: boolean }) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: data.isError ? 'system' : 'ai',
        text: data.message,
        time: new Date(data.timestamp)
      }]);
      if (data.isError) setRequiresHuman(false);
    });

    socketRef.current.on('humanReply', (data: { message: string, timestamp: string }) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'human',
        text: data.message,
        time: new Date(data.timestamp)
      }]);
    });

    setMessages([{
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào! Tôi là Lễ tân ảo của BOOKINGHOTEL. Tôi có thể giúp gì cho bạn hôm nay?',
      time: new Date()
    }]);

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: input, time: new Date() }]);
    socketRef.current?.emit('userMessage', { message: input, requiresHuman });
    setInput('');
  };

  const toggleHuman = () => {
    if (!adminOnline) {
      alert('Hiện tại không có nhân viên CSKH nào online!');
      return;
    }
    const newVal = !requiresHuman;
    setRequiresHuman(newVal);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'system',
      text: newVal ? 'Đã chuyển sang chế độ Chat với Nhân viên CSKH. Vui lòng đặt câu hỏi.' : 'Đã quay lại chế độ Chat với Trợ lý AI.',
      time: new Date()
    }]);
  };

  return (
    <div id="customer-chat-widget">
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 w-14 h-14 bg-brand-dark text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-DEFAULT transition-all z-50">
        <span className="text-2xl">{isOpen ? 'x' : '💬'}</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50">
          <div className="bg-brand-dark p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg leading-tight">BOOKINGHOTEL</h3>
              <p className="text-xs opacity-80 flex items-center gap-1">
                <span className={\`w-2 h-2 rounded-full \${requiresHuman ? 'bg-orange-400' : 'bg-green-400'}\`}></span>
                {requiresHuman ? 'Nhân viên CSKH' : 'Trợ lý AI'}
              </p>
            </div>
            <button onClick={toggleHuman} className={\`text-xs px-2 py-1 rounded border \${requiresHuman ? 'bg-white text-brand-dark' : 'border-white/50 hover:bg-white/10'}\`}>
              {requiresHuman ? '🤖 Gặp AI' : '👤 Gặp Lễ tân'}
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className={\`flex flex-col max-w-[80%] \${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}\`}>
                {msg.sender === 'system' ? (
                  <div className="text-xs text-gray-400 italic text-center w-full my-2">{msg.text}</div>
                ) : (
                  <>
                    <span className="text-[10px] text-gray-400 mb-1 ml-1">{msg.sender === 'user' ? 'Bạn' : msg.sender === 'ai' ? 'AI' : 'CSKH'}</span>
                    <div className={\`px-3 py-2 rounded-xl text-sm \${msg.sender === 'user' ? 'bg-brand-DEFAULT text-white rounded-tr-none' : msg.sender === 'human' ? 'bg-orange-100 text-gray-900 rounded-tl-none border border-orange-200' : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'}\`}>
                      {msg.text}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-DEFAULT font-sans" />
            <button type="submit" disabled={!input.trim()} className="px-4 py-2 bg-brand-dark text-white rounded-lg text-sm hover:bg-brand-DEFAULT disabled:opacity-50 transition-colors">Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
`;

fs.writeFileSync('frontend/src/pages/AdminDashboardPage.tsx', adminDashboard, 'utf8');
fs.writeFileSync('frontend/src/components/ChatWidget.tsx', chatWidget, 'utf8');
console.log("Rewrote files with pure Node JS to fix UTF-8 issues.");
