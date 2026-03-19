export function formatVND(amount) {
  if (!amount && amount !== 0) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN');
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Chờ xử lý',
    survey_scheduled: 'Đã hẹn khảo sát',
    surveyed: 'Đã khảo sát',
    quoted: 'Đã báo giá',
    confirmed: 'Đã chốt',
    in_progress: 'Đang thi công',
    completed: 'Hoàn thành',
    paid: 'Đã thu tiền',
    cancelled: 'Đã hủy'
  };
  return labels[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    survey_scheduled: 'bg-cyan-100 text-cyan-800',
    surveyed: 'bg-indigo-100 text-indigo-800',
    quoted: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    paid: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getTypeLabel(type) {
  const labels = { install: 'Lắp đặt', repair: 'Sửa chữa', maintain: 'Bảo trì' };
  return labels[type] || type;
}

export function getDeptLabel(dept) {
  const labels = {
    director: 'Giám đốc',
    accounting: 'Kế toán',
    cskh: 'CSKH / Sale',
    installation: 'Thi công'
  };
  return labels[dept] || dept;
}
