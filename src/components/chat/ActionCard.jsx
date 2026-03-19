import { formatVND } from '../../utils/format';

const toolLabels = {
  create_customer_and_order: '📋 Tạo KH + Đơn',
  check_and_schedule_survey: '📅 Hẹn khảo sát',
  create_customer: '👤 Tạo khách hàng',
  search_customers: '🔍 Tìm khách hàng',
  create_order: '📋 Tạo đơn hàng',
  check_technician_availability: '📅 Check lịch thợ',
  schedule_survey: '🔍 Hẹn khảo sát',
  submit_survey_result: '📝 Kết quả khảo sát',
  create_quotation: '💲 Báo giá',
  confirm_order: '✅ Xác nhận đơn',
  update_order_status: '✏️ Cập nhật đơn',
  list_orders: '📊 Danh sách đơn',
  get_order_detail: '📋 Chi tiết đơn',
  create_transaction: '💰 Ghi nhận thu/chi',
  get_revenue_report: '📈 Báo cáo doanh thu',
  list_users: '👥 Nhân viên',
  schedule_maintenance: '🔧 Lịch bảo trì',
  get_customer_history: '📖 Lịch sử KH',
  get_dashboard_stats: '📊 Thống kê',
  send_notification: '🔔 Thông báo',
  get_my_schedule: '📅 Lịch làm việc',
  search_decision_memory: '🧠 Tìm tiền lệ',
  ask_director: '❓ Hỏi Giám đốc',
  save_decision: '💾 Lưu quyết định',
  manage_base_rules: '📏 Nguyên tắc',
  list_pending_decisions: '📋 Câu hỏi chờ'
};

export default function ActionCard({ action }) {
  const { tool, result } = action;
  if (!result || result.error) return null;

  const label = toolLabels[tool] || tool;

  // Pending action - show waiting state
  if (result.pending_action) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-3 text-sm">
        <div className="flex items-center gap-2 font-medium text-amber-700 mb-1">
          <span className="animate-pulse">⏳</span>
          <span>{label}</span>
          <span className="text-amber-500 ml-auto text-xs font-normal">Chờ xác nhận →</span>
        </div>
        <p className="text-amber-800 text-xs">{result.preview_title}</p>
        {result.preview_details && (
          <div className="mt-1 space-y-0.5">
            {result.preview_details.map((d, i) => (
              <div key={i} className="text-xs text-amber-700">
                <span className="font-medium">{d.label}:</span> {d.value}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-amber-600 mt-2 italic">Xem panel bên phải để xác nhận</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
      <div className="flex items-center gap-2 font-medium text-blue-700 mb-1">
        <span>{label}</span>
        <span className="text-green-600 ml-auto text-xs">✓</span>
      </div>

      {result.message && (
        <p className="text-gray-700 whitespace-pre-line">{result.message}</p>
      )}

      {/* Quotation details */}
      {tool === 'create_quotation' && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white rounded p-2 text-center">
            <div className="text-gray-500">Vật tư</div>
            <div className="font-medium">{formatVND(result.material_cost)}</div>
          </div>
          <div className="bg-white rounded p-2 text-center">
            <div className="text-gray-500">Nhân công</div>
            <div className="font-medium">{formatVND(result.labor_cost)}</div>
          </div>
          <div className="bg-white rounded p-2 text-center">
            <div className="text-blue-600 font-medium">TỔNG</div>
            <div className="font-bold text-blue-700">{formatVND(result.total_cost)}</div>
          </div>
        </div>
      )}

      {/* Revenue report */}
      {tool === 'get_revenue_report' && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-green-50 rounded p-2 text-center">
            <div className="text-green-700 font-medium">Thu</div>
            <div className="text-green-800">{formatVND(result.total_income)}</div>
          </div>
          <div className="bg-red-50 rounded p-2 text-center">
            <div className="text-red-700 font-medium">Chi</div>
            <div className="text-red-800">{formatVND(result.total_expense)}</div>
          </div>
          <div className="bg-blue-50 rounded p-2 text-center">
            <div className="text-blue-700 font-medium">Lợi nhuận</div>
            <div className="text-blue-800">{formatVND(result.net_profit)}</div>
          </div>
        </div>
      )}

      {/* Transaction */}
      {tool === 'create_transaction' && (
        <div className="mt-1 text-xs">
          <span className={result.type_name === 'Thu' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {result.type_name}: {formatVND(result.amount)}
          </span>
        </div>
      )}

      {/* List results */}
      {Array.isArray(result) && result.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          Tìm thấy {result.length} kết quả
        </div>
      )}

      {/* Schedule results */}
      {tool === 'get_my_schedule' && result.schedules && (
        <div className="mt-2 text-xs text-gray-600">
          {result.schedules.length} lịch từ {result.from} đến {result.to}
        </div>
      )}
    </div>
  );
}
