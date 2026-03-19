import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatDateTime, formatVND, getStatusLabel, getStatusColor, getTypeLabel } from '../../utils/format';

export default function ActivityFeed({ refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('notifications');

  useEffect(() => { loadActivity(); }, [refreshKey]);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const res = await api.get('/decisions/activity');
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Đang tải...</div>;
  if (!data) return <div className="p-6 text-center text-red-400">Lỗi tải dữ liệu</div>;

  const subTabs = [
    { id: 'notifications', label: 'Thông báo', icon: '🔔', count: data.notifications?.length },
    { id: 'orders', label: 'Đơn hàng', icon: '📋', count: data.recentOrders?.length },
    { id: 'transactions', label: 'Thu chi', icon: '💰', count: data.recentTransactions?.length },
  ];

  return (
    <div className="p-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${
              tab === t.id ? 'bg-white text-gray-800 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.count > 0 && <span className="text-xs text-gray-400">({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="space-y-2">
          {data.notifications?.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">Chưa có thông báo</p>
          )}
          {data.notifications?.map(n => (
            <div key={n.id} className={`rounded-lg px-3 py-2.5 text-sm border ${
              n.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <p className="text-gray-800">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="space-y-2">
          {data.recentOrders?.map(o => (
            <div key={o.id} className="bg-white rounded-lg px-3 py-2.5 text-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-800">#{o.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(o.status)}`}>
                  {getStatusLabel(o.status)}
                </span>
                <span className="text-xs text-gray-400">{getTypeLabel(o.type)}</span>
              </div>
              <p className="text-gray-600 text-xs">{o.customer_name} - {o.description?.substring(0, 50)}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                {o.assigned_name && <span>Thợ: {o.assigned_name}</span>}
                <span className="ml-auto">{formatDateTime(o.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transactions */}
      {tab === 'transactions' && (
        <div className="space-y-2">
          {data.recentTransactions?.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">Chưa có giao dịch</p>
          )}
          {data.recentTransactions?.map(t => (
            <div key={t.id} className="bg-white rounded-lg px-3 py-2.5 text-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {t.type === 'income' ? 'Thu' : 'Chi'}
                </span>
                <span className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatVND(t.amount)}
                </span>
                {t.order_id && <span className="text-xs text-gray-400">Đơn #{t.order_id}</span>}
              </div>
              <p className="text-gray-600 text-xs mt-1">{t.description}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDateTime(t.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
