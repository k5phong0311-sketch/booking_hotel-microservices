import React, { useState, useEffect, useRef } from 'react';
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
    // Kết nối tới API Gateway (Port 3000)
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

    // Lời chào ban đầu
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

    // Thêm tin nhắn của user vào UI
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      time: new Date()
    }]);

    // Gửi qua socket
    socketRef.current?.emit('userMessage', {
      message: input,
      requiresHuman
    });

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
    <>
      {/* Nút bấm tròn góc dưới phải */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-dark text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-DEFAULT transition-all z-50"
      >
        {isOpen ? (
          <span className="text-2xl font-bold font-sans">×</span>
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </button>

      {/* Khung Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-brand-dark p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg leading-tight">BOOKINGHOTEL</h3>
              <p className="text-xs opacity-80 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${requiresHuman ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                {requiresHuman ? 'Nhân viên CSKH' : 'Trợ lý AI Thông minh'}
              </p>
            </div>
            <button 
              onClick={toggleHuman}
              className={`text-xs px-2 py-1 rounded border ${requiresHuman ? 'bg-white text-brand-dark' : 'border-white/50 hover:bg-white/10'} transition-colors`}
              title="Chuyển đổi Chatbot / Người thật"
            >
              {requiresHuman ? '🤖 Gặp AI' : '👤 Gặp Lễ tân'}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {msg.sender === 'system' ? (
                  <div className="text-xs text-gray-400 italic text-center w-full my-2">{msg.text}</div>
                ) : (
                  <>
                    <span className="text-[10px] text-gray-400 mb-1 ml-1">
                      {msg.sender === 'user' ? 'Bạn' : msg.sender === 'ai' ? 'AI' : 'CSKH'}
                    </span>
                    <div 
                      className={`px-3 py-2 rounded-xl text-sm ${
                        msg.sender === 'user' 
                          ? 'bg-brand-DEFAULT text-white rounded-tr-none' 
                          : msg.sender === 'human'
                            ? 'bg-orange-100 text-gray-900 rounded-tl-none border border-orange-200'
                            : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..." 
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-DEFAULT font-sans"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 bg-brand-dark text-white rounded-lg text-sm hover:bg-brand-DEFAULT disabled:opacity-50 transition-colors"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
