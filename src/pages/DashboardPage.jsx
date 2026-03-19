import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/shared/StatCard';
import DataTable from '../components/shared/DataTable';
import RevenueChart from '../components/charts/RevenueChart';
import OrderStatusChart from '../components/charts/OrderStatusChart';
import { formatVND, formatDate, getStatusLabel, getStatusColor, getTypeLabel, getDeptLabel } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Đang tải dashboard...</div>;
  if (!stats) return <div className="flex items-center justify-center h-full text-red-400">Lỗi tải dữ liệu</div>;

  const dept = user.department;

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Dashboard - {getDeptLabel(dept)}
      </h1>

      {/* Workflow Pipeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Pipeline đơn hàng</h3>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            { label: 'Chờ xử lý', value: stats.pending_orders, color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Hẹn khảo sát', value: stats.survey_scheduled, color: 'bg-cyan-100 text-cyan-700' },
            { label: 'Cần báo giá', value: stats.awaiting_quote, color: 'bg-indigo-100 text-indigo-700' },
            { label: 'Đã chốt', value: stats.confirmed_orders, color: 'bg-blue-100 text-blue-700' },
            { label: 'Đang thi công', value: stats.in_progress_orders, color: 'bg-purple-100 text-purple-700' },
            { label: 'Cần thu tiền', value: stats.completed_unpaid, color: 'bg-orange-100 text-orange-700' },
            { label: 'Đã thu tiền', value: stats.paid_this_month, color: 'bg-green-100 text-green-700' },
            { label: 'Tổng tháng', value: stats.orders_this_month, color: 'bg-gray-100 text-gray-700' },
          ].map((item, i) => (
            <div key={i} className={`rounded-lg p-3 ${item.color}`}>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Stats */}
      {(dept === 'director' || dept === 'accounting') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Thu tháng này" value={formatVND(stats.income_month)} icon="💰" color="green" />
          <StatCard title="Chi tháng này" value={formatVND(stats.expense_month)} icon="💸" color="red" />
          <StatCard title="Lợi nhuận" value={formatVND(stats.net_profit)} icon="📈" color="blue" />
          <StatCard title="Khách hàng" value={stats.total_customers} icon="👤" color="purple" />
        </div>
      )}

      {/* Charts */}
      {(dept === 'director' || dept === 'accounting') && stats.monthly_revenue && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Doanh thu 6 tháng</h3>
            <RevenueChart data={stats.monthly_revenue} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Đơn hàng theo trạng thái</h3>
            <OrderStatusChart data={stats.orders_by_status} />
          </div>
        </div>
      )}

      {/* Upcoming Schedule (Installation) */}
      {stats.upcoming_schedule && stats.upcoming_schedule.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Lịch làm việc sắp tới</h3>
          <DataTable
            columns={['Ngày', 'Loại', 'Khung giờ', 'Đơn hàng', 'Khách hàng', 'Địa chỉ']}
            rows={stats.upcoming_schedule.map(s => [
              formatDate(s.date),
              s.type === 'survey' ? '🔍 Khảo sát' : '🔧 Thi công',
              s.time_slot,
              s.order_id ? `#${s.order_id}` : '-',
              s.customer_name || '-',
              s.customer_address || '-'
            ])}
          />
        </div>
      )}

      {/* Recent Orders */}
      {stats.recent_orders && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Đơn hàng gần đây</h3>
          <DataTable
            columns={['#', 'Loại', 'Khách hàng', 'Mô tả', 'Phụ trách', 'Trạng thái', 'Ngày KS', 'Ngày TC']}
            rows={stats.recent_orders.map(o => [
              o.id,
              getTypeLabel(o.type),
              o.customer_name || '-',
              o.description?.substring(0, 30) || '-',
              o.assigned_name || '-',
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(o.status)}`}>{getStatusLabel(o.status)}</span>,
              o.survey_date ? formatDate(o.survey_date) : '-',
              o.work_date ? formatDate(o.work_date) : '-'
            ])}
          />
        </div>
      )}

      {/* Upcoming Maintenance */}
      {stats.upcoming_maintenance && stats.upcoming_maintenance.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Lịch bảo trì sắp tới</h3>
          <DataTable
            columns={['Khách hàng', 'SĐT', 'Ngày bảo trì', 'Ghi chú']}
            rows={stats.upcoming_maintenance.map(m => [
              m.customer_name, m.customer_phone, formatDate(m.next_date), m.notes || '-'
            ])}
          />
        </div>
      )}

      {/* Recent Transactions */}
      {stats.recent_transactions && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Giao dịch gần đây</h3>
          <DataTable
            columns={['#', 'Loại', 'Số tiền', 'Mô tả', 'Đơn hàng', 'Ngày']}
            rows={stats.recent_transactions.map(t => [
              t.id,
              <span className={t.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {t.type === 'income' ? 'Thu' : 'Chi'}
              </span>,
              <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>{formatVND(t.amount)}</span>,
              t.description?.substring(0, 40) || '-',
              t.order_id ? `#${t.order_id}` : '-',
              formatDate(t.created_at)
            ])}
          />
        </div>
      )}
    </div>
  );
}
