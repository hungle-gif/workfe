import { useState, useEffect } from 'react';
import api from '../../api/client';

const deptLabels = {
  director: 'Giám đốc', accounting: 'Kế toán',
  cskh: 'CSKH', installation: 'Thi công'
};

const typeLabels = { survey: 'Khảo sát', work: 'Thi công', busy: 'Bận' };

function formatMoney(v) {
  if (!v) return '0';
  return Number(v).toLocaleString('vi-VN');
}

export default function MyProfilePanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('schedule');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/decisions/my-profile');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Đang tải...</div>;
  if (!data) return <div className="p-6 text-center text-gray-400">Không tải được dữ liệu</div>;

  const { user, schedule, pastSchedule, performance: perf, salaryRecords } = data;
  const tabs = [
    { id: 'schedule', label: 'Lịch làm việc', icon: '📅' },
    { id: 'performance', label: 'Hiệu suất', icon: '📊' },
    { id: 'salary', label: 'Lương thưởng', icon: '💰' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
            👤
          </div>
          <div>
            <div className="font-semibold text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">
              {deptLabels[user.department]} • {user.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'schedule' && <ScheduleTab schedule={schedule} pastSchedule={pastSchedule} />}
        {tab === 'performance' && <PerformanceTab perf={perf} />}
        {tab === 'salary' && <SalaryTab records={salaryRecords} />}
      </div>
    </div>
  );
}

function ScheduleTab({ schedule, pastSchedule }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">📅 Lịch sắp tới</h3>
        {schedule.length === 0 ? (
          <div className="text-xs text-gray-400 bg-white rounded-lg p-3">Chưa có lịch</div>
        ) : (
          <div className="space-y-2">
            {schedule.map(s => (
              <div key={s.id} className="bg-white rounded-lg p-3 shadow-sm border-l-3 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{s.date} - {s.time_slot}</div>
                    <div className="text-xs text-blue-600 font-medium mt-0.5">
                      {typeLabels[s.type] || s.type}
                    </div>
                  </div>
                  {s.order_id && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Đơn #{s.order_id}
                    </span>
                  )}
                </div>
                {s.order_desc && (
                  <div className="text-xs text-gray-600 mt-1">{s.order_desc}</div>
                )}
                {s.customer_name && (
                  <div className="text-xs text-gray-500 mt-1">
                    🏠 {s.customer_name} {s.customer_address ? `- ${s.customer_address}` : ''} {s.customer_phone ? `(${s.customer_phone})` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">📋 Lịch sử công việc</h3>
        {pastSchedule.length === 0 ? (
          <div className="text-xs text-gray-400 bg-white rounded-lg p-3">Chưa có lịch sử</div>
        ) : (
          <div className="space-y-1">
            {pastSchedule.map((s, i) => (
              <div key={i} className="bg-white rounded-lg px-3 py-2 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-600">{s.date}</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="text-gray-600">{s.time_slot}</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="font-medium text-gray-700">{typeLabels[s.type] || s.type}</span>
                </div>
                {s.order_id && (
                  <span className="text-gray-400">Đơn #{s.order_id}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PerformanceTab({ perf }) {
  const rateColor = perf.completion_rate >= 80 ? 'text-green-600' : perf.completion_rate >= 50 ? 'text-yellow-600' : 'text-red-600';
  const rateBg = perf.completion_rate >= 80 ? 'bg-green-50' : perf.completion_rate >= 50 ? 'bg-yellow-50' : 'bg-red-50';

  const stats = [
    { label: 'Tổng đơn', value: perf.total_orders, icon: '📋' },
    { label: 'Hoàn thành', value: perf.completed_orders, icon: '✅' },
    { label: 'Đang làm', value: perf.in_progress_orders, icon: '🔧' },
    { label: 'Quá hạn', value: perf.overdue_orders, icon: '⚠️', warn: perf.overdue_orders > 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Tỷ lệ hoàn thành */}
      <div className={`${rateBg} rounded-xl p-4 text-center`}>
        <div className={`text-3xl font-bold ${rateColor}`}>{perf.completion_rate}%</div>
        <div className="text-xs text-gray-600 mt-1">Tỷ lệ hoàn thành</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full transition-all ${perf.completion_rate >= 80 ? 'bg-green-500' : perf.completion_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${perf.completion_rate}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s, i) => (
          <div key={i} className={`bg-white rounded-lg p-3 text-center shadow-sm ${s.warn ? 'border border-red-200' : ''}`}>
            <div className="text-lg">{s.icon}</div>
            <div className={`text-xl font-bold ${s.warn ? 'text-red-600' : 'text-gray-800'}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tháng này */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">📅 Tháng này</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Đơn nhận</span>
            <span className="font-medium">{perf.orders_this_month}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Đã hoàn thành</span>
            <span className="font-medium text-green-600">{perf.completed_this_month}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Doanh thu tháng</span>
            <span className="font-medium text-blue-600">{formatMoney(perf.total_revenue_month)}đ</span>
          </div>
        </div>
      </div>

      {/* Tổng */}
      <div className="bg-blue-50 rounded-lg p-3 text-center">
        <div className="text-xs text-gray-500">Tổng doanh thu đóng góp</div>
        <div className="text-lg font-bold text-blue-700">{formatMoney(perf.total_revenue)}đ</div>
      </div>
    </div>
  );
}

function SalaryTab({ records }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">💰</div>
        <div className="text-sm text-gray-500">Chưa có dữ liệu lương</div>
      </div>
    );
  }

  const statusLabels = { draft: 'Nháp', confirmed: 'Đã duyệt', paid: 'Đã trả' };
  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    confirmed: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-3">
      {records.map((r, i) => (
        <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold text-gray-700">Tháng {r.month}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[r.status] || ''}`}>
              {statusLabels[r.status] || r.status}
            </span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Lương cơ bản</span>
              <span className="font-medium">{formatMoney(r.base_salary)}đ</span>
            </div>
            {r.bonus > 0 && (
              <div className="flex justify-between">
                <span className="text-green-600">+ Thưởng {r.bonus_note ? `(${r.bonus_note})` : ''}</span>
                <span className="font-medium text-green-600">+{formatMoney(r.bonus)}đ</span>
              </div>
            )}
            {r.penalty > 0 && (
              <div className="flex justify-between">
                <span className="text-red-600">- Phạt {r.penalty_note ? `(${r.penalty_note})` : ''}</span>
                <span className="font-medium text-red-600">-{formatMoney(r.penalty)}đ</span>
              </div>
            )}
            <div className="border-t pt-1.5 flex justify-between">
              <span className="font-semibold text-gray-700">Thực nhận</span>
              <span className="font-bold text-blue-700 text-base">{formatMoney(r.total)}đ</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
