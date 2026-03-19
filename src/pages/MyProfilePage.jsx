import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const deptLabels = {
  director: 'Giám đốc', accounting: 'Kế toán',
  cskh: 'CSKH', installation: 'Thi công'
};
const typeLabels = { survey: 'Khảo sát', work: 'Thi công', busy: 'Bận' };

function fmt(v) {
  if (!v) return '0';
  return Number(v).toLocaleString('vi-VN');
}

export default function MyProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

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

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Đang tải...</div>;
  if (!data) return <div className="flex items-center justify-center h-full text-gray-400">Không tải được dữ liệu</div>;

  const { schedule, pastSchedule, performance: perf, salaryRecords } = data;

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'schedule', label: 'Lịch làm việc', icon: '📅' },
    { id: 'salary', label: 'Lương & Thưởng', icon: '💰' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl text-white shadow-md">
            {user.department === 'director' ? '👔' :
             user.department === 'accounting' ? '💼' :
             user.department === 'cskh' ? '🎧' : '👷'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-sm text-gray-500">{deptLabels[user.department]} | {user.phone}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b px-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === t.id
                ? 'text-blue-700 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'overview' && <OverviewTab perf={perf} schedule={schedule} />}
        {tab === 'schedule' && <ScheduleTab schedule={schedule} pastSchedule={pastSchedule} />}
        {tab === 'salary' && <SalaryTab records={salaryRecords} />}
      </div>
    </div>
  );
}

function OverviewTab({ perf, schedule }) {
  const rateColor = perf.completion_rate >= 80 ? 'text-green-600' : perf.completion_rate >= 50 ? 'text-yellow-600' : 'text-red-600';
  const rateBg = perf.completion_rate >= 80 ? 'bg-green-500' : perf.completion_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon="📋" label="Tổng đơn" value={perf.total_orders} color="bg-blue-50 text-blue-700" />
        <KPICard icon="✅" label="Hoàn thành" value={perf.completed_orders} color="bg-green-50 text-green-700" />
        <KPICard icon="🔧" label="Đang làm" value={perf.in_progress_orders} color="bg-purple-50 text-purple-700" />
        <KPICard icon="⚠️" label="Quá hạn" value={perf.overdue_orders} color={perf.overdue_orders > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'} />
      </div>

      {/* Completion Rate + Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Tỷ lệ hoàn thành</h3>
          <div className="flex items-end gap-3">
            <span className={`text-4xl font-bold ${rateColor}`}>{perf.completion_rate}%</span>
            <span className="text-sm text-gray-400 pb-1">({perf.completed_orders}/{perf.total_orders} đơn)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div className={`h-3 rounded-full ${rateBg} transition-all`} style={{ width: `${Math.min(perf.completion_rate, 100)}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Doanh thu đóng góp</h3>
          <div className="text-3xl font-bold text-blue-700">{fmt(perf.total_revenue)}đ</div>
          <div className="text-sm text-gray-400 mt-1">Tháng này: <span className="text-blue-600 font-medium">{fmt(perf.total_revenue_month)}đ</span></div>
        </div>
      </div>

      {/* This month */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Tháng này</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Đơn nhận</span>
            <span className="font-semibold">{perf.orders_this_month}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Đã hoàn thành</span>
            <span className="font-semibold text-green-600">{perf.completed_this_month}</span>
          </div>
        </div>
      </div>

      {/* Upcoming schedule preview */}
      {schedule.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Lịch sắp tới</h3>
          <div className="space-y-2">
            {schedule.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="text-lg">{s.type === 'survey' ? '🔍' : s.type === 'work' ? '🔧' : '📌'}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">{s.date} - {s.time_slot}</div>
                  <div className="text-xs text-gray-500">{s.order_desc || typeLabels[s.type]}</div>
                </div>
                {s.customer_name && <div className="text-xs text-gray-400">{s.customer_name}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ icon, label, value, color }) {
  return (
    <div className={`${color} rounded-xl p-4 shadow-sm`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  );
}

function ScheduleTab({ schedule, pastSchedule }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">Lịch sắp tới</h3>
        {schedule.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-gray-400">Chưa có lịch</div>
        ) : (
          <div className="space-y-3">
            {schedule.map(s => (
              <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800">{s.date} - {s.time_slot}</div>
                    <div className="text-sm text-blue-600 font-medium mt-0.5">{typeLabels[s.type] || s.type}</div>
                  </div>
                  {s.order_id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">Đơn #{s.order_id}</span>}
                </div>
                {s.order_desc && <div className="text-sm text-gray-600 mt-2">{s.order_desc}</div>}
                {s.customer_name && (
                  <div className="text-sm text-gray-500 mt-1">
                    KH: {s.customer_name} {s.customer_address ? `- ${s.customer_address}` : ''} {s.customer_phone ? `(${s.customer_phone})` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">Lịch sử công việc</h3>
        {pastSchedule.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-gray-400">Chưa có lịch sử</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Ngày</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Ca</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Loại</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Đơn</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {pastSchedule.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{s.date}</td>
                    <td className="px-4 py-2">{s.time_slot}</td>
                    <td className="px-4 py-2">{typeLabels[s.type] || s.type}</td>
                    <td className="px-4 py-2">{s.order_id ? `#${s.order_id}` : '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        s.order_status === 'completed' || s.order_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>{s.order_status || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SalaryTab({ records }) {
  const statusLabels = { draft: 'Nháp', confirmed: 'Đã duyệt', paid: 'Đã trả' };
  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    confirmed: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <div className="text-5xl mb-3">💰</div>
        <div className="text-gray-500">Chưa có dữ liệu lương</div>
        <div className="text-sm text-gray-400 mt-1">Giám đốc sẽ cập nhật bảng lương hàng tháng</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      {records.map((r, i) => (
        <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Tháng {r.month}</h3>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[r.status] || ''}`}>
              {statusLabels[r.status] || r.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Lương cơ bản</span>
              <span className="font-medium">{fmt(r.base_salary)}đ</span>
            </div>
            {r.bonus > 0 && (
              <div className="flex justify-between py-1 bg-green-50 -mx-2 px-2 rounded">
                <span className="text-green-700">+ Thưởng {r.bonus_note ? `(${r.bonus_note})` : ''}</span>
                <span className="font-medium text-green-700">+{fmt(r.bonus)}đ</span>
              </div>
            )}
            {r.penalty > 0 && (
              <div className="flex justify-between py-1 bg-red-50 -mx-2 px-2 rounded">
                <span className="text-red-700">- Phạt {r.penalty_note ? `(${r.penalty_note})` : ''}</span>
                <span className="font-medium text-red-700">-{fmt(r.penalty)}đ</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold text-gray-700">Thực nhận</span>
              <span className="font-bold text-blue-700 text-lg">{fmt(r.total)}đ</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
