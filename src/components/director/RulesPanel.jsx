import { useState, useEffect } from 'react';
import api from '../../api/client';

const categoryLabels = {
  pricing: 'Giá cả', workflow: 'Quy trình', customer: 'Khách hàng',
  hr: 'Nhân sự', policy: 'Chính sách', other: 'Khác'
};
const categoryIcons = {
  pricing: '💲', workflow: '🔄', customer: '👤', hr: '👥', policy: '📋', other: '📝'
};
const categoryColors = {
  pricing: 'border-green-200 bg-green-50',
  workflow: 'border-blue-200 bg-blue-50',
  customer: 'border-purple-200 bg-purple-50',
  hr: 'border-orange-200 bg-orange-50',
  policy: 'border-red-200 bg-red-50',
  other: 'border-gray-200 bg-gray-50'
};

export default function RulesPanel({ refreshKey }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ category: 'workflow', rule_title: '', rule_content: '', priority: 5 });

  useEffect(() => { loadRules(); }, [refreshKey]);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/decisions/rules');
      setRules(res.data.rules);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!addForm.rule_title.trim() || !addForm.rule_content.trim()) return;
    try {
      await api.post('/decisions/rules', addForm);
      setShowAdd(false);
      setAddForm({ category: 'workflow', rule_title: '', rule_content: '', priority: 5 });
      loadRules();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (id) => {
    try {
      await api.put(`/decisions/rules/${id}`, editForm);
      setEditingId(null);
      loadRules();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/decisions/rules/${id}`);
      loadRules();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Đang tải...</div>;

  // Group by category
  const grouped = {};
  for (const r of rules) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">{rules.length} nguyên tắc đang hoạt động</div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Thêm nguyên tắc
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="font-medium text-sm text-blue-800">Thêm nguyên tắc mới</div>
          <div className="flex gap-2">
            <select
              value={addForm.category}
              onChange={e => setAddForm(prev => ({ ...prev, category: e.target.value }))}
              className="text-sm border rounded-lg px-2 py-1.5"
            >
              {Object.entries(categoryLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              value={addForm.rule_title}
              onChange={e => setAddForm(prev => ({ ...prev, rule_title: e.target.value }))}
              placeholder="Tên nguyên tắc..."
              className="flex-1 text-sm border rounded-lg px-3 py-1.5"
            />
            <input
              type="number" min="1" max="10"
              value={addForm.priority}
              onChange={e => setAddForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
              className="w-16 text-sm border rounded-lg px-2 py-1.5 text-center"
              title="Độ ưu tiên (1-10)"
            />
          </div>
          <textarea
            value={addForm.rule_content}
            onChange={e => setAddForm(prev => ({ ...prev, rule_content: e.target.value }))}
            placeholder="Nội dung nguyên tắc chi tiết..."
            rows={3}
            className="w-full text-sm border rounded-lg px-3 py-2 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">
              Lưu
            </button>
            <button onClick={() => setShowAdd(false)} className="text-xs bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg">
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Rules by category */}
      {Object.entries(grouped).map(([cat, catRules]) => (
        <div key={cat} className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span>{categoryIcons[cat] || '📝'}</span>
            <span>{categoryLabels[cat] || cat}</span>
            <span className="text-xs text-gray-400">({catRules.length})</span>
          </div>
          {catRules.map(r => (
            <div key={r.id} className={`rounded-lg border p-3 ${categoryColors[cat] || categoryColors.other}`}>
              {editingId === r.id ? (
                <div className="space-y-2">
                  <input
                    value={editForm.rule_title}
                    onChange={e => setEditForm(prev => ({ ...prev, rule_title: e.target.value }))}
                    className="w-full text-sm border rounded-lg px-3 py-1.5"
                  />
                  <textarea
                    value={editForm.rule_content}
                    onChange={e => setEditForm(prev => ({ ...prev, rule_content: e.target.value }))}
                    rows={3}
                    className="w-full text-sm border rounded-lg px-3 py-2 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(r.id)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg">Lưu</button>
                    <button onClick={() => setEditingId(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg">Hủy</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{r.rule_title}</span>
                        <span className="text-xs bg-white/60 text-gray-500 px-1.5 py-0.5 rounded">
                          Ưu tiên: {r.priority}/10
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1 whitespace-pre-line">{r.rule_content}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setEditingId(r.id); setEditForm({ rule_title: r.rule_title, rule_content: r.rule_content }); }}
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ))}

      {rules.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📏</div>
          <p className="text-gray-500 text-sm">Chưa có nguyên tắc nào</p>
        </div>
      )}
    </div>
  );
}
