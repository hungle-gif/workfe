import { useState } from 'react';
import api from '../../api/client';
import { formatVND, formatDateTime } from '../../utils/format';

const toolLabels = {
  create_customer_and_order: 'Tạo KH + Đơn hàng',
  check_and_schedule_survey: 'Hẹn khảo sát',
  create_customer: 'Tạo khách hàng',
  search_customers: 'Tìm khách hàng',
  create_order: 'Tạo đơn hàng',
  check_technician_availability: 'Kiểm tra lịch thợ',
  schedule_survey: 'Đặt lịch khảo sát',
  submit_survey_result: 'Báo kết quả khảo sát',
  create_quotation: 'Tạo báo giá',
  confirm_order: 'Xác nhận đơn hàng',
  update_order_status: 'Cập nhật trạng thái',
  list_orders: 'Xem danh sách đơn',
  get_order_detail: 'Xem chi tiết đơn',
  create_transaction: 'Ghi nhận giao dịch',
  get_revenue_report: 'Xem báo cáo doanh thu',
  list_users: 'Xem danh sách NV',
  schedule_maintenance: 'Lên lịch bảo trì',
  get_customer_history: 'Xem lịch sử KH',
  get_dashboard_stats: 'Xem thống kê',
  send_notification: 'Gửi thông báo',
  get_my_schedule: 'Xem lịch làm việc',
  search_decision_memory: 'Tìm tiền lệ',
  ask_director: 'Hỏi Giám đốc',
  save_decision: 'Lưu quyết định',
  manage_base_rules: 'Quản lý nguyên tắc',
  list_pending_decisions: 'Xem câu hỏi chờ',
};

// === PENDING ACTION CARD (needs user confirmation) ===
function PendingActionCard({ action, onConfirm, onReject }) {
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedParams, setEditedParams] = useState(action.params);
  const [status, setStatus] = useState('pending'); // pending | confirmed | rejected

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const body = editing ? { editedParams } : {};
      const res = await api.post(`/chat/confirm-action/${action.id}`, body);
      if (res.data.success) {
        setStatus('confirmed');
        onConfirm?.(action.id, res.data.result);
      }
    } catch (err) {
      console.error('Confirm error:', err);
    } finally {
      setConfirming(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      const res = await api.post(`/chat/reject-action/${action.id}`);
      if (res.data.success) {
        setStatus('rejected');
        onReject?.(action.id);
      }
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setRejecting(false);
    }
  };

  const handleParamChange = (key, value) => {
    setEditedParams(prev => ({ ...prev, [key]: value }));
  };

  if (status === 'confirmed') {
    return (
      <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4">
        <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
          <span className="text-lg">✅</span>
          <span>Đã xác nhận: {action.title}</span>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 opacity-60">
        <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
          <span className="text-lg">❌</span>
          <span>Đã hủy: {action.title}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 shadow-md animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl animate-pulse">⏳</span>
        <div>
          <div className="font-semibold text-amber-800 text-sm">{action.title}</div>
          <div className="text-xs text-amber-600">{toolLabels[action.tool] || action.tool} - Chờ xác nhận</div>
        </div>
      </div>

      {/* Preview details */}
      <div className="bg-white rounded-lg border border-amber-200 p-3 mb-3 space-y-2">
        {action.details?.map((detail, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-amber-500 font-medium min-w-[100px] flex-shrink-0">{detail.label}:</span>
            {editing ? (
              <input
                type="text"
                value={editedParams[getParamKey(action.tool, detail.label)] || detail.value}
                onChange={e => handleParamChange(getParamKey(action.tool, detail.label), e.target.value)}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-amber-400"
              />
            ) : (
              <span className="text-gray-800">{detail.value}</span>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {confirming ? (
            <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Đang xử lý...</span>
          ) : (
            <span>✓ Xác nhận</span>
          )}
        </button>

        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2.5 rounded-lg font-medium text-sm border border-amber-400 text-amber-700 hover:bg-amber-100 transition-colors"
        >
          ✎ Sửa
        </button>

        <button
          onClick={handleReject}
          disabled={rejecting}
          className="px-4 py-2.5 rounded-lg font-medium text-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
        >
          ✗ Hủy
        </button>
      </div>
    </div>
  );
}

// Map detail labels back to param keys for editing
function getParamKey(tool, label) {
  const mapping = {
    'Tên': 'customer_name',
    'Khách hàng': 'customer_name',
    'SĐT': 'customer_phone',
    'Địa chỉ': 'customer_address',
    'Loại đơn': 'order_type',
    'Loại': 'type',
    'Mô tả': tool === 'create_customer_and_order' ? 'order_description' : 'description',
    'Số tiền': 'amount',
    'Ngày': tool === 'check_and_schedule_survey' ? 'preferred_date' : 'survey_date',
    'Khung giờ': tool === 'check_and_schedule_survey' ? 'preferred_time_slot' : 'time_slot',
    'Ngày thi công': 'work_date',
    'Ngày tiếp theo': 'next_date',
    'Chu kỳ': 'interval_months',
    'Ghi chú': 'notes',
    'Nội dung': 'message',
  };
  return mapping[label] || label.toLowerCase().replace(/\s+/g, '_');
}

// === COMPLETED ACTION CARD (already executed - read or confirmed) ===
function CompletedActionCard({ action }) {
  const isPending = action.result?.pending_action;
  const isError = action.result?.error;
  const isRead = !isPending && !isError;

  return (
    <div className={`rounded-lg border p-3 ${isError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{isError ? '❌' : '👁️'}</span>
        <span className={`text-xs font-medium ${isError ? 'text-red-700' : 'text-gray-600'}`}>
          {toolLabels[action.tool] || action.tool}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded ml-auto ${isError ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
          {isError ? 'Lỗi' : 'Đã tra cứu'}
        </span>
      </div>
      {action.result?.message && (
        <p className="mt-1 text-xs text-gray-500 truncate">{action.result.message.split('\n')[0].substring(0, 80)}</p>
      )}
      {isError && (
        <p className="mt-1 text-xs text-red-600">{action.result.error}</p>
      )}
    </div>
  );
}

// === MAIN PANEL ===
export default function ConfirmationPanel({ actionLog, pendingActions, onActionConfirmed, onActionRejected }) {
  const hasPending = pendingActions && pendingActions.length > 0;
  const hasActions = actionLog && actionLog.length > 0;

  if (!hasPending && !hasActions) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 px-6">
        <div className="text-5xl mb-3">🛡️</div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">Kiểm soát hành động AI</h3>
        <p className="text-xs text-center leading-relaxed">
          Mọi thay đổi dữ liệu AI đề xuất sẽ hiển thị ở đây.<br />
          Bạn phải <strong>xác nhận</strong> trước khi dữ liệu được ghi vào hệ thống.<br />
          Tra cứu (search, list, report) chạy ngay - không cần xác nhận.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 bg-white border-b flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-medium text-gray-400">KIỂM SOÁT HÀNH ĐỘNG</span>
        {hasPending && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse ml-auto">
            ⏳ {pendingActions.length} chờ xác nhận
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Pending Actions (top priority) */}
        {hasPending && (
          <div>
            <div className="text-xs font-semibold text-amber-700 uppercase mb-2 flex items-center gap-1">
              <span>⚠️ Cần xác nhận</span>
            </div>
            <div className="space-y-3">
              {pendingActions.map(action => (
                <PendingActionCard
                  key={action.id}
                  action={action}
                  onConfirm={onActionConfirmed}
                  onReject={onActionRejected}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Actions (read-only, history) */}
        {hasActions && (
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase mb-2">
              Lịch sử tra cứu
            </div>
            <div className="space-y-2">
              {[...actionLog].reverse().filter(a => !a.result?.pending_action).slice(0, 20).map((action, i) => (
                <CompletedActionCard key={i} action={action} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
