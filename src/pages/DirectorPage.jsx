import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/chat/MessageBubble';
import SuggestedActions from '../components/chat/SuggestedActions';
import QuickStatsBar from '../components/director/QuickStatsBar';
import PendingDecisionPanel from '../components/director/PendingDecisionPanel';
import DecisionMemoryPanel from '../components/director/DecisionMemoryPanel';
import ActivityFeed from '../components/director/ActivityFeed';
import WorkflowPanel from '../components/director/WorkflowPanel';
import StaffPanel from '../components/director/StaffPanel';
import RulesPanel from '../components/director/RulesPanel';
import ConfirmationPanel from '../components/chat/ConfirmationPanel';

export default function DirectorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [rightTab, setRightTab] = useState('confirm');
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionLog, setActionLog] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/chat/history');
      const msgs = res.data.messages.map(m => ({
        id: m.id, role: m.role, content: m.content,
        actions: m.metadata_json ? JSON.parse(m.metadata_json) : [],
        time: m.created_at
      }));
      setMessages(msgs);

      // Build action log from history
      const log = [];
      for (let i = 0; i < msgs.length; i++) {
        const msg = msgs[i];
        if (msg.role === 'assistant' && msg.actions?.length > 0) {
          const userMsg = i > 0 && msgs[i - 1].role === 'user' ? msgs[i - 1].content : '';
          for (const action of msg.actions) {
            log.push({ tool: action.tool, result: action.result, time: msg.time, userMessage: userMsg });
          }
        }
      }
      setActionLog(log);
    } catch (err) { console.error('Failed to load history:', err); }
    finally { setHistoryLoaded(true); }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg, time: new Date().toISOString() }]);
    setLoading(true);
    try {
      const res = await api.post('/chat/send', { message: msg });
      const aiMsg = {
        id: Date.now() + 1, role: 'assistant', content: res.data.content,
        actions: res.data.actions || [], time: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      setRefreshKey(k => k + 1);

      // Add to action log
      if (aiMsg.actions.length > 0) {
        const newActions = aiMsg.actions.map(action => ({
          tool: action.tool, result: action.result, time: aiMsg.time, userMessage: msg
        }));
        setActionLog(prev => [...prev, ...newActions]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.', actions: [], time: new Date().toISOString()
      }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const rightTabs = [
    { id: 'confirm', label: 'Xác nhận', icon: '✅' },
    { id: 'decisions', label: 'Quyết định', icon: '⚡' },
    { id: 'memory', label: 'Bộ nhớ AI', icon: '🧠' },
    { id: 'rules', label: 'Nguyên tắc', icon: '📏' },
    { id: 'staff', label: 'Nhân sự', icon: '👥' },
    { id: 'workflow', label: 'Luồng CV', icon: '🔄' },
    { id: 'activity', label: 'Hoạt động', icon: '📋' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Quick Stats Bar */}
      <QuickStatsBar refreshKey={refreshKey} />

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Chat (50%) */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {!historyLoaded && (
              <div className="text-center text-gray-400 py-8">Đang tải...</div>
            )}
            {historyLoaded && messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">👔</div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Xin chào Giám đốc!</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Chat với AI để quản lý công ty. AI sẽ hỏi bạn khi cần quyết định và học từ câu trả lời của bạn.
                </p>
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

          <SuggestedActions department="director" onSelect={sendMessage} disabled={loading} />

          <div className="border-t bg-white px-3 py-2">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn... (Enter để gửi)"
                rows={1}
                className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Panels (50%) */}
        <div className="w-1/2 flex flex-col bg-gray-50">
          <div className="flex border-b bg-white overflow-x-auto">
            {rightTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  rightTab === tab.id
                    ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {rightTab === 'confirm' && <ConfirmationPanel actionLog={actionLog} />}
            {rightTab === 'decisions' && <PendingDecisionPanel refreshKey={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} />}
            {rightTab === 'memory' && <DecisionMemoryPanel refreshKey={refreshKey} />}
            {rightTab === 'rules' && <RulesPanel refreshKey={refreshKey} />}
            {rightTab === 'staff' && <StaffPanel refreshKey={refreshKey} />}
            {rightTab === 'workflow' && <WorkflowPanel />}
            {rightTab === 'activity' && <ActivityFeed refreshKey={refreshKey} />}
          </div>
        </div>
      </div>
    </div>
  );
}
