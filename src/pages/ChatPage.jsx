import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/chat/MessageBubble';
import SuggestedActions from '../components/chat/SuggestedActions';
import ConfirmationPanel from '../components/chat/ConfirmationPanel';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [actionLog, setActionLog] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadHistory();
    loadPendingActions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/chat/history');
      const msgs = res.data.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        actions: m.metadata_json ? JSON.parse(m.metadata_json) : [],
        time: m.created_at
      }));
      setMessages(msgs);

      const log = [];
      for (let i = 0; i < msgs.length; i++) {
        const msg = msgs[i];
        if (msg.role === 'assistant' && msg.actions?.length > 0) {
          const userMsg = i > 0 && msgs[i - 1].role === 'user' ? msgs[i - 1].content : '';
          for (const action of msg.actions) {
            log.push({
              tool: action.tool,
              result: action.result,
              time: msg.time,
              userMessage: userMsg
            });
          }
        }
      }
      setActionLog(log);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoaded(true);
    }
  };

  const loadPendingActions = async () => {
    try {
      const res = await api.get('/chat/pending-actions');
      setPendingActions(res.data.actions || []);
    } catch (err) {
      console.error('Failed to load pending actions:', err);
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg = { id: Date.now(), role: 'user', content: msg, time: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/chat/send', { message: msg });
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.content,
        actions: res.data.actions || [],
        time: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);

      if (aiMsg.actions.length > 0) {
        const newActions = aiMsg.actions.map(action => ({
          tool: action.tool,
          result: action.result,
          time: aiMsg.time,
          userMessage: msg
        }));
        setActionLog(prev => [...prev, ...newActions]);
      }

      // Add new pending actions from this response
      if (res.data.pendingActions?.length > 0) {
        setPendingActions(prev => [...res.data.pendingActions, ...prev]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
        actions: [],
        time: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleActionConfirmed = (actionId, result) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));
    const confirmMsg = {
      id: Date.now(),
      role: 'assistant',
      content: `✅ ${result?.message || 'Đã xác nhận thành công.'}`,
      actions: [],
      time: new Date().toISOString()
    };
    setMessages(prev => [...prev, confirmMsg]);
  };

  const handleActionRejected = (actionId) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));
    const rejectMsg = {
      id: Date.now(),
      role: 'assistant',
      content: '❌ Đã hủy hành động. Dữ liệu không thay đổi.',
      actions: [],
      time: new Date().toISOString()
    };
    setMessages(prev => [...prev, rejectMsg]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full">
      {/* LEFT: Chat (55%) */}
      <div className="w-[55%] flex flex-col border-r border-gray-200">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {!historyLoaded && (
            <div className="text-center text-gray-400 py-8">Đang tải...</div>
          )}

          {historyLoaded && messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">❄️</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Xin chào, {user.name}!
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Tôi là trợ lý AI. Bạn có thể chat với tôi để quản lý khách hàng, đơn hàng,
                lịch bảo trì và nhiều việc khác. Hãy thử nói gì đó!
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg max-w-sm mx-auto">
                <p className="text-xs text-amber-700">
                  🛡️ <strong>An toàn:</strong> Mọi thay đổi dữ liệu (tạo khách, đơn hàng, giao dịch...)
                  cần được bạn xác nhận ở panel bên phải trước khi lưu vào hệ thống.
                </p>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {loading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">🤖</div>
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <SuggestedActions department={user.department} onSelect={sendMessage} disabled={loading} />

        <div className="border-t bg-white px-4 py-3">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn... (Enter để gửi)"
              rows={1}
              className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Confirmation Panel (45%) */}
      <div className="w-[45%] bg-gray-50">
        <ConfirmationPanel
          actionLog={actionLog}
          pendingActions={pendingActions}
          onActionConfirmed={handleActionConfirmed}
          onActionRejected={handleActionRejected}
        />
      </div>
    </div>
  );
}
