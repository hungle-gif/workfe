import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatDateTime, formatDate, formatVND } from '../../utils/format';

const deptLabels = { director: 'Giám đốc', accounting: 'Kế toán', cskh: 'CSKH / Sale', installation: 'Thi công' };
const deptIcons = { director: '👔', accounting: '💼', cskh: '🎧', installation: '👷' };
const deptColors = {
  director: 'bg-amber-100 text-amber-700 border-amber-200',
  accounting: 'bg-blue-100 text-blue-700 border-blue-200',
  cskh: 'bg-green-100 text-green-700 border-green-200',
  installation: 'bg-purple-100 text-purple-700 border-purple-200'
};
const scheduleTypeLabels = { survey: '🔍 Khảo sát', work: '🔧 Thi công', busy: '⛔ Bận' };
const statusLabels = {
  pending: 'Chờ xử lý', survey_scheduled: 'Hẹn KS', surveyed: 'Đã KS', quoted: 'Đã BG',
  confirmed: 'Đã chốt', in_progress: 'Đang TC', completed: 'Xong', paid: 'Đã thu', cancelled: 'Hủy'
};

export default function StaffPanel({ refreshKey }) {
  const [staff, setStaff] = useState([]);
  const [staffStats, setStaffStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('schedule');
  const [salaryForm, setSalaryForm] = useState(null);
  const [salaryMonth, setSalaryMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => { loadStaff(); }, [refreshKey]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/decisions/staff');
      setStaff(res.data.staff);
      setStaffStats(res.data.stats || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/decisions/staff/${id}`);
      setDetail(res.data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const selectStaff = (id) => {
    if (selectedId === id) { setSelectedId(null); setDetail(null); return; }
    setSelectedId(id);
    setDetailTab('schedule');
    loadDetail(id);
  };

  const saveSalary = async () => {
    if (!salaryForm) return;
    try {
      await api.post('/decisions/salary', { ...salaryForm, user_id: selectedId, month: salaryMonth });
      loadDetail(selectedId);
      setSalaryForm(null);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Đang tải...</div>;

  // Group by department
  const grouped = {};
  for (const s of staff) {
    if (!grouped[s.department]) grouped[s.department] = [];
    grouped[s.department].push(s);
  }

  return (
    <div className="p-4 space-y-3">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(deptLabels).map(([dept, label]) => (
          <div key={dept} className={`rounded-lg p-2 text-center border ${deptColors[dept]}`}>
            <div className="text-lg">{deptIcons[dept]}</div>
            <div className="text-lg font-bold">{grouped[dept]?.length || 0}</div>
            <div className="text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Staff list */}
      {Object.entries(grouped).map(([dept, members]) => (
        <div key={dept} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
            <span>{deptIcons[dept]}</span>
            <span className="font-medium text-sm text-gray-800">{deptLabels[dept]}</span>
            <span className="text-xs text-gray-400">({members.length})</span>
          </div>

          <div className="divide-y">
            {members.map(m => {
              const stats = staffStats[m.id] || {};
              const isSelected = selectedId === m.id;

              return (
                <div key={m.id}>
                  {/* Staff row */}
                  <button onClick={() => selectStaff(m.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border ${deptColors[dept]}`}>
                        {deptIcons[dept]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{m.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${m.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {m.active ? 'HĐ' : 'Nghỉ'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">SĐT: {m.phone}</div>
                      </div>
                      {/* Quick stats */}
                      <div className="flex gap-2 text-xs">
                        {stats.total_orders > 0 && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{stats.total_orders} đơn</span>}
                        {stats.completed_orders > 0 && <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded">{stats.completed_orders} xong</span>}
                        {stats.upcoming_schedules > 0 && <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">{stats.upcoming_schedules} lịch</span>}
                      </div>
                      <span className="text-gray-400 text-xs">{isSelected ? '▼' : '▶'}</span>
                    </div>
                  </button>

                  {/* Detail panel */}
                  {isSelected && (
                    <div className="border-t bg-gray-50/80">
                      {detailLoading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Đang tải...</div>
                      ) : detail ? (
                        <div>
                          {/* Detail tabs */}
                          <div className="flex border-b bg-white">
                            {[
                              { id: 'schedule', label: 'Lịch làm việc', icon: '📅' },
                              { id: 'performance', label: 'Hiệu suất', icon: '📊' },
                              { id: 'salary', label: 'Lương/Thưởng/Phạt', icon: '💰' },
                            ].map(t => (
                              <button key={t.id} onClick={() => setDetailTab(t.id)}
                                className={`flex-1 text-xs py-2 flex items-center justify-center gap-1 ${
                                  detailTab === t.id ? 'text-blue-700 border-b-2 border-blue-600 font-medium' : 'text-gray-500'
                                }`}
                              >
                                <span>{t.icon}</span><span>{t.label}</span>
                              </button>
                            ))}
                          </div>

                          <div className="p-4">
                            {/* SCHEDULE TAB */}
                            {detailTab === 'schedule' && (
                              <div className="space-y-3">
                                <div className="text-xs font-medium text-gray-500 uppercase">Lịch sắp tới</div>
                                {detail.schedule?.length === 0 && (
                                  <p className="text-xs text-gray-400 py-2">Chưa có lịch</p>
                                )}
                                {detail.schedule?.map((s, i) => (
                                  <div key={i} className="bg-white rounded-lg border p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm">{scheduleTypeLabels[s.type] || s.type}</span>
                                      <span className="text-xs font-medium text-gray-800">{formatDate(s.date)}</span>
                                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s.time_slot}</span>
                                      {s.order_id && <span className="text-xs text-blue-600">Đơn #{s.order_id}</span>}
                                    </div>
                                    {s.customer_name && (
                                      <div className="text-xs text-gray-500">
                                        KH: {s.customer_name} {s.customer_phone && `(${s.customer_phone})`}
                                        {s.customer_address && ` - ${s.customer_address}`}
                                      </div>
                                    )}
                                    {s.order_desc && <div className="text-xs text-gray-500 mt-0.5">{s.order_desc}</div>}
                                  </div>
                                ))}

                                {detail.pastSchedule?.length > 0 && (
                                  <>
                                    <div className="text-xs font-medium text-gray-500 uppercase mt-4">Lịch sử làm việc</div>
                                    {detail.pastSchedule.map((s, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs bg-white rounded-lg border px-3 py-2">
                                        <span>{scheduleTypeLabels[s.type] || s.type}</span>
                                        <span className="text-gray-700">{formatDate(s.date)}</span>
                                        <span className="text-gray-500">{s.time_slot}</span>
                                        {s.order_id && <span className="text-blue-600">#{s.order_id}</span>}
                                        {s.order_status && <span className="text-gray-400">[{statusLabels[s.order_status] || s.order_status}]</span>}
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            )}

                            {/* PERFORMANCE TAB */}
                            {detailTab === 'performance' && detail.performance && (
                              <div className="space-y-4">
                                {/* KPI cards */}
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                                    <div className="text-2xl font-bold text-blue-700">{detail.performance.total_orders}</div>
                                    <div className="text-xs text-blue-600">Tổng đơn</div>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                                    <div className="text-2xl font-bold text-green-700">{detail.performance.completed_orders}</div>
                                    <div className="text-xs text-green-600">Hoàn thành</div>
                                  </div>
                                  <div className={`rounded-lg p-3 text-center border ${detail.performance.completion_rate >= 80 ? 'bg-emerald-50 border-emerald-200' : detail.performance.completion_rate >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className={`text-2xl font-bold ${detail.performance.completion_rate >= 80 ? 'text-emerald-700' : detail.performance.completion_rate >= 50 ? 'text-yellow-700' : 'text-red-700'}`}>
                                      {detail.performance.completion_rate}%
                                    </div>
                                    <div className="text-xs text-gray-600">Tỉ lệ HT</div>
                                  </div>
                                </div>

                                {/* Monthly stats */}
                                <div className="bg-white rounded-lg border p-3">
                                  <div className="text-xs font-medium text-gray-500 uppercase mb-2">Tháng này</div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Đơn mới:</span><span className="font-medium">{detail.performance.orders_this_month}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Hoàn thành:</span><span className="font-medium text-green-600">{detail.performance.completed_this_month}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Đang TC:</span><span className="font-medium text-purple-600">{detail.performance.in_progress_orders}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Quá hạn:</span><span className={`font-medium ${detail.performance.overdue_orders > 0 ? 'text-red-600' : 'text-gray-400'}`}>{detail.performance.overdue_orders}</span></div>
                                  </div>
                                </div>

                                {/* Revenue */}
                                <div className="bg-white rounded-lg border p-3">
                                  <div className="text-xs font-medium text-gray-500 uppercase mb-2">Doanh thu phụ trách</div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-gray-500">Tổng:</span> <span className="font-medium text-blue-600">{formatVND(detail.performance.total_revenue)}</span></div>
                                    <div><span className="text-gray-500">Tháng này:</span> <span className="font-medium text-green-600">{formatVND(detail.performance.total_revenue_month)}</span></div>
                                  </div>
                                </div>

                                {/* Activity */}
                                <div className="bg-white rounded-lg border p-3">
                                  <div className="text-xs font-medium text-gray-500 uppercase mb-2">Hoạt động</div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Tổng tin nhắn:</span><span className="font-medium">{detail.performance.total_messages}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Tháng này:</span><span className="font-medium">{detail.performance.messages_this_month}</span></div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SALARY TAB */}
                            {detailTab === 'salary' && (
                              <div className="space-y-3">
                                {/* Add/Edit salary */}
                                <div className="bg-white rounded-lg border p-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="text-xs font-medium text-gray-500 uppercase">Tạo bảng lương</div>
                                    <input type="month" value={salaryMonth} onChange={e => setSalaryMonth(e.target.value)}
                                      className="ml-auto text-xs border rounded px-2 py-1" />
                                  </div>
                                  {!salaryForm ? (
                                    <button onClick={() => setSalaryForm({ base_salary: 0, bonus: 0, bonus_note: '', penalty: 0, penalty_note: '' })}
                                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                                      + Tạo / Sửa lương tháng {salaryMonth}
                                    </button>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <label className="text-xs text-gray-500">Lương cơ bản</label>
                                          <input type="number" value={salaryForm.base_salary}
                                            onChange={e => setSalaryForm(p => ({ ...p, base_salary: Number(e.target.value) }))}
                                            className="w-full text-sm border rounded px-2 py-1 mt-0.5" />
                                        </div>
                                        <div>
                                          <label className="text-xs text-green-600">Thưởng</label>
                                          <input type="number" value={salaryForm.bonus}
                                            onChange={e => setSalaryForm(p => ({ ...p, bonus: Number(e.target.value) }))}
                                            className="w-full text-sm border rounded px-2 py-1 mt-0.5" />
                                        </div>
                                        <div>
                                          <label className="text-xs text-red-600">Phạt</label>
                                          <input type="number" value={salaryForm.penalty}
                                            onChange={e => setSalaryForm(p => ({ ...p, penalty: Number(e.target.value) }))}
                                            className="w-full text-sm border rounded px-2 py-1 mt-0.5" />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-xs text-green-600">Lý do thưởng</label>
                                          <input value={salaryForm.bonus_note}
                                            onChange={e => setSalaryForm(p => ({ ...p, bonus_note: e.target.value }))}
                                            placeholder="VD: Hoàn thành tốt..."
                                            className="w-full text-xs border rounded px-2 py-1 mt-0.5" />
                                        </div>
                                        <div>
                                          <label className="text-xs text-red-600">Lý do phạt</label>
                                          <input value={salaryForm.penalty_note}
                                            onChange={e => setSalaryForm(p => ({ ...p, penalty_note: e.target.value }))}
                                            placeholder="VD: Đi muộn 3 lần..."
                                            className="w-full text-xs border rounded px-2 py-1 mt-0.5" />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-sm font-medium text-gray-800">
                                          Tổng: <span className="text-blue-600">{formatVND((salaryForm.base_salary || 0) + (salaryForm.bonus || 0) - (salaryForm.penalty || 0))}</span>
                                        </div>
                                        <button onClick={saveSalary} className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">Lưu</button>
                                        <button onClick={() => setSalaryForm(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg">Hủy</button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Salary history */}
                                <div className="text-xs font-medium text-gray-500 uppercase">Lịch sử lương</div>
                                {(!detail.salaryRecords || detail.salaryRecords.length === 0) && (
                                  <p className="text-xs text-gray-400 py-2">Chưa có bảng lương</p>
                                )}
                                {detail.salaryRecords?.map(sr => (
                                  <div key={sr.id} className="bg-white rounded-lg border p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium text-gray-800">Tháng {sr.month}</span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        sr.status === 'paid' ? 'bg-green-100 text-green-700' :
                                        sr.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>
                                        {sr.status === 'paid' ? 'Đã trả' : sr.status === 'confirmed' ? 'Đã duyệt' : 'Nháp'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-xs">
                                      <div className="text-center">
                                        <div className="text-gray-500">Cơ bản</div>
                                        <div className="font-medium">{formatVND(sr.base_salary)}</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-green-600">Thưởng</div>
                                        <div className="font-medium text-green-700">{sr.bonus > 0 ? '+' : ''}{formatVND(sr.bonus)}</div>
                                        {sr.bonus_note && <div className="text-gray-400 truncate">{sr.bonus_note}</div>}
                                      </div>
                                      <div className="text-center">
                                        <div className="text-red-600">Phạt</div>
                                        <div className="font-medium text-red-700">{sr.penalty > 0 ? '-' : ''}{formatVND(sr.penalty)}</div>
                                        {sr.penalty_note && <div className="text-gray-400 truncate">{sr.penalty_note}</div>}
                                      </div>
                                      <div className="text-center">
                                        <div className="text-blue-600 font-medium">TỔNG</div>
                                        <div className="font-bold text-blue-700">{formatVND(sr.total)}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
