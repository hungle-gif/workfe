const suggestions = {
  director: [
    'Tổng quan hôm nay',
    'Xem câu hỏi đang chờ trả lời',
    'Xem nguyên tắc công ty',
    'Báo cáo doanh thu tháng này',
    'Đơn hàng đang chờ xử lý',
    'Xem bộ nhớ quyết định'
  ],
  accounting: [
    'Báo cáo thu chi tháng này',
    'Đơn hàng cần xuất hóa đơn',
    'Giao dịch gần đây',
    'Công nợ chưa thanh toán',
    'Doanh thu tuần này'
  ],
  cskh: [
    'Thêm khách hàng mới',
    'Tạo đơn hàng mới',
    'Check lịch thợ để hẹn khảo sát',
    'Đơn cần lên báo giá',
    'Đơn hoàn thành cần thu tiền',
    'Tìm khách hàng'
  ],
  installation: [
    'Lịch làm việc của tôi',
    'Đơn cần khảo sát',
    'Báo cáo kết quả khảo sát',
    'Cập nhật tiến độ thi công',
    'Báo hoàn thành đơn hàng'
  ]
};

export default function SuggestedActions({ department, onSelect, disabled }) {
  const actions = suggestions[department] || suggestions.cskh;

  return (
    <div className="px-4 py-2 flex gap-2 overflow-x-auto">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => onSelect(action)}
          disabled={disabled}
          className="flex-shrink-0 text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 transition-colors"
        >
          {action}
        </button>
      ))}
    </div>
  );
}
