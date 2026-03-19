import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatVND } from '../../utils/format';

export default function QuickStatsBar({ refreshKey }) {
  const [stats, setStats] = useState(null);

  useEffect(() => { loadStats(); }, [refreshKey]);

  const loadStats = async () => {
    try {
      const res = await api.get('/decisions/quick-stats');
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  if (!stats) return null;

  const items = [
    {
      icon: '⚡', label: 'Chờ quyết định',
      value: stats.pending_decisions,
      color: stats.pending_decisions > 0 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-gray-600 bg-gray-50 border-gray-200',
      pulse: stats.pending_decisions > 0
    },
    { icon: '🧠', label: 'Bộ nhớ AI', value: stats.total_decisions_saved, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { icon: '📏', label: 'Nguyên tắc', value: stats.total_rules, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { icon: '📋', label: 'Đơn chờ', value: stats.pending_orders, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { icon: '🔧', label: 'Đang TC', value: stats.in_progress_orders, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { icon: '💰', label: 'Cần thu', value: stats.completed_unpaid, color: stats.completed_unpaid > 0 ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-gray-600 bg-gray-50 border-gray-200' },
    { icon: '📈', label: 'Thu tháng', value: formatVND(stats.income_month), color: 'text-green-600 bg-green-50 border-green-200', isText: true },
    { icon: '📊', label: 'Lợi nhuận', value: formatVND(stats.net_profit), color: stats.net_profit >= 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200', isText: true },
  ];

  return (
    <div className="bg-white border-b px-4 py-2.5">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-medium text-gray-400 flex-shrink-0 mr-1">TỔNG QUAN</span>
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs flex-shrink-0 ${item.color} ${item.pulse ? 'animate-pulse' : ''}`}
          >
            <span>{item.icon}</span>
            <span className="text-gray-500">{item.label}</span>
            <span className="font-bold">{item.isText ? item.value : item.value}</span>
          </div>
        ))}
        {stats.unread_notifications > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs flex-shrink-0 text-red-600 bg-red-50 border-red-200 animate-pulse">
            <span>🔔</span>
            <span className="font-bold">{stats.unread_notifications} mới</span>
          </div>
        )}
      </div>
    </div>
  );
}
