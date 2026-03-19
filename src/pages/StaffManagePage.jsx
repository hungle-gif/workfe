import { useState, useEffect } from 'react';
import api from '../api/client';

const deptLabels = {
  director: 'Giám đốc', accounting: 'Kế toán',
  cskh: 'CSKH', installation: 'Thi công'
};
const deptIcons = { director: '👔', accounting: '💼', cskh: '🎧', installation: '👷' };

function fmt(v) { return v ? Number(v).toLocaleString('vi-VN') : '0'; }

export default function StaffManagePage() {
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('performance');
  const [salaryForm, setSalaryForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    try {
      const res = await api.get('/decisions/staff');
      setStaff(res.data.staff);
      setStats(res.data.stats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadDetail = async (id) => {
    if (selectedId === id) { setSelectedId(null); setDetail(null); return; }
    setSelectedId(id);
    setDetail(null);
    setDetailTab('performance');
    setSalaryForm(null);
    try {
      const res = await api.get(`/decisions/staff/${id}`);
      setDetail(res.data);
    } catch (err) { console.error(err); }
  };

  const openSalaryForm = (userId) => {
    const now = new Date();
    setSalaryForm({
      user_id: userId,
      month: now.toISOString().slice(0, 7),
      base_salary: '', bonus: '', bonus_note: '', penalty: '', penalty_note: ''
    });
  };

  const saveSalary = async () => {
    if (!salaryForm) return;
    setSaving(true);
    try {
      await api.post('/decisions/salary', {
        ...salaryForm,
        base_salary: Number(salaryForm.base_salary) || 0,
        bonus: Number(salaryForm.bonus) || 0,
        penalty: Number(salaryForm.penalty) || 0,
      });
      // Reload detail
      const res = await api.get(`/decisions/staff/${salaryForm.user_id}`);
      setDetail(res.data);
      setSalaryForm(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const updateSalaryStatus = async (salaryId, status) => {
    try {
      await api.put(`/decisions/salary/${salaryId}/status`, { status });
      if (selectedId) {
        const res = await api.get(`/decisions/staff/${selectedId}`);
        setDetail(res.data);
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Đang tải...</div>;

  const statusLabels = { draft: 'Nháp', confirmed: 'Đã duyệt', paid: 'Đã trả' };
  const statusColors = { draft: 'bg-gray-100 text-gray-600', confirmed: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700' };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Quản lý Nhân sự</h1>
        <p className="text-sm text-gray-500">Đánh giá hiệu suất, quản lý lương thưởng phạt</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl space-y-3">
          {staff.map(s => {
            const st = stats[s.id] || {};
            const isSelected = selectedId === s.id;

            return (
              <div key={s.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Staff row */}
                <button
                  onClick={() => loadDetail(s.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                    {deptIcons[s.department] || '👤'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{s.name}</div>
                    <div className="text-xs text-gray-500">{deptLabels[s.department]} | {s.phone}</div>
                  </div>
                  <div className="flex gap-6 text-center text-xs">
                    <div>
                      <div className="text-lg font-bold text-gray-700">{st.total_orders || 0}</div>
                      <div className="text-gray-400">Đơn</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{st.completed_orders || 0}</div>
                      <div className="text-gray-400">Xong</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{st.upcoming_schedules || 0}</div>
                      <div className="text-gray-400">Lịch</div>
                    </div>
                  </div>
                  <span className={`text-gray-400 transition-transform ${isSelected ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {/* Detail panel */}
                {isSelected && detail && (
                  <div className="border-t bg-gray-50">
                    <div className="flex border-b bg-white">
                      {[
                        { id: 'performance', label: 'Hiệu suất', icon: '📊' },
                        { id: 'schedule', label: 'Lịch', icon: '📅' },
                        { id: 'salary', label: 'Lương thưởng', icon: '💰' },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setDetailTab(t.id)}
                          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                            detailTab === t.id ? 'text-blue-700 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'
                          }`}
                        >
                          <span>{t.icon}</span><span>{t.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-5">
                      {detailTab === 'performance' && (
                        <PerformanceDetail perf={detail.performance} />
                      )}

                      {detailTab === 'schedule' && (
                        <ScheduleDetail schedule={detail.schedule} pastSchedule={detail.pastSchedule} />
                      )}

                      {detailTab === 'salary' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-gray-700">Bảng lương</h4>
                            <button
                              onClick={() => openSalaryForm(s.id)}
                              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                            >
                              + Thêm lương tháng
                            </button>
                          </div>

                          {/* Salary form */}
                          {salaryForm && salaryForm.user_id === s.id && (
                            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Tháng</label>
                                  <input type="month" value={salaryForm.month}
                                    onChange={e => setSalaryForm({...salaryForm, month: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Lương cơ bản (VNĐ)</label>
                                  <input type="number" placeholder="VD: 8000000" value={salaryForm.base_salary}
                                    onChange={e => setSalaryForm({...salaryForm, base_salary: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Thưởng (VNĐ)</label>
                                  <input type="number" placeholder="0" value={salaryForm.bonus}
                                    onChange={e => setSalaryForm({...salaryForm, bonus: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Lý do thưởng</label>
                                  <input type="text" placeholder="VD: Hoàn thành tốt" value={salaryForm.bonus_note}
                                    onChange={e => setSalaryForm({...salaryForm, bonus_note: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Phạt (VNĐ)</label>
                                  <input type="number" placeholder="0" value={salaryForm.penalty}
                                    onChange={e => setSalaryForm({...salaryForm, penalty: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Lý do phạt</label>
                                  <input type="text" placeholder="VD: Đi muộn" value={salaryForm.penalty_note}
                                    onChange={e => setSalaryForm({...salaryForm, penalty_note: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                              </div>

                              {/* Preview */}
                              <div className="bg-blue-50 rounded-lg p-3 mb-3 text-sm">
                                <span className="text-gray-600">Thực nhận: </span>
                                <span className="font-bold text-blue-700">
                                  {fmt((Number(salaryForm.base_salary) || 0) + (Number(salaryForm.bonus) || 0) - (Number(salaryForm.penalty) || 0))}đ
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button onClick={saveSalary} disabled={saving}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                                  {saving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                                <button onClick={() => setSalaryForm(null)}
                                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                                  Hủy
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Salary records */}
                          {detail.salaryRecords.length === 0 ? (
                            <div className="text-center text-gray-400 py-4 text-sm">Chưa có dữ liệu lương</div>
                          ) : (
                            <div className="space-y-3">
                              {detail.salaryRecords.map((r, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="font-semibold text-gray-700">Tháng {r.month}</span>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>
                                        {statusLabels[r.status]}
                                      </span>
                                      {r.status === 'draft' && (
                                        <button onClick={() => updateSalaryStatus(r.id, 'confirmed')}
                                          className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-200">
                                          Duyệt
                                        </button>
                                      )}
                                      {r.status === 'confirmed' && (
                                        <button onClick={() => updateSalaryStatus(r.id, 'paid')}
                                          className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200">
                                          Đã trả
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-sm space-y-1">
                                    <div className="flex justify-between"><span className="text-gray-500">Cơ bản</span><span>{fmt(r.base_salary)}đ</span></div>
                                    {r.bonus > 0 && <div className="flex justify-between text-green-700"><span>+ Thưởng {r.bonus_note ? `(${r.bonus_note})` : ''}</span><span>+{fmt(r.bonus)}đ</span></div>}
                                    {r.penalty > 0 && <div className="flex justify-between text-red-700"><span>- Phạt {r.penalty_note ? `(${r.penalty_note})` : ''}</span><span>-{fmt(r.penalty)}đ</span></div>}
                                    <div className="border-t pt-1 flex justify-between font-semibold"><span>Thực nhận</span><span className="text-blue-700">{fmt(r.total)}đ</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PerformanceDetail({ perf }) {
  const rateColor = perf.completion_rate >= 80 ? 'text-green-600' : perf.completion_rate >= 50 ? 'text-yellow-600' : 'text-red-600';
  const rateBg = perf.completion_rate >= 80 ? 'bg-green-500' : perf.completion_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-700">{perf.total_orders}</div>
          <div className="text-xs text-gray-500">Tổng đơn</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-700">{perf.completed_orders}</div>
          <div className="text-xs text-gray-500">Hoàn thành</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-700">{perf.in_progress_orders}</div>
          <div className="text-xs text-gray-500">Đang làm</div>
        </div>
        <div className={`rounded-lg p-3 text-center ${perf.overdue_orders > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className={`text-xl font-bold ${perf.overdue_orders > 0 ? 'text-red-700' : 'text-gray-700'}`}>{perf.overdue_orders}</div>
          <div className="text-xs text-gray-500">Quá hạn</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
          <span className={`text-lg font-bold ${rateColor}`}>{perf.completion_rate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${rateBg}`} style={{ width: `${Math.min(perf.completion_rate, 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white rounded-lg p-3">
          <div className="text-gray-500">Đơn tháng này</div>
          <div className="font-bold text-lg">{perf.orders_this_month}</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-gray-500">Xong tháng này</div>
          <div className="font-bold text-lg text-green-600">{perf.completed_this_month}</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-gray-500">Doanh thu tổng</div>
          <div className="font-bold text-blue-700">{fmt(perf.total_revenue)}đ</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-gray-500">Doanh thu tháng</div>
          <div className="font-bold text-blue-700">{fmt(perf.total_revenue_month)}đ</div>
        </div>
      </div>
    </div>
  );
}

function ScheduleDetail({ schedule, pastSchedule }) {
  const typeLabels = { survey: 'Khảo sát', work: 'Thi công', busy: 'Bận' };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-2">Sắp tới ({schedule.length})</h4>
        {schedule.length === 0 ? (
          <div className="text-sm text-gray-400">Chưa có lịch</div>
        ) : (
          <div className="space-y-2">
            {schedule.map(s => (
              <div key={s.id} className="bg-white rounded-lg p-3 border-l-3 border-blue-500 text-sm">
                <div className="font-medium">{s.date} - {s.time_slot} ({typeLabels[s.type]})</div>
                {s.order_desc && <div className="text-gray-500 text-xs mt-1">{s.order_desc}</div>}
                {s.customer_name && <div className="text-gray-400 text-xs">KH: {s.customer_name}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-2">Lịch sử ({pastSchedule.length})</h4>
        {pastSchedule.length === 0 ? (
          <div className="text-sm text-gray-400">Chưa có</div>
        ) : (
          <div className="space-y-1">
            {pastSchedule.map((s, i) => (
              <div key={i} className="bg-white rounded-lg px-3 py-2 text-xs flex justify-between">
                <span>{s.date} | {s.time_slot} | {typeLabels[s.type]}</span>
                {s.order_id && <span className="text-gray-400">Đơn #{s.order_id}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
