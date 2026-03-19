import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatDateTime } from '../../utils/format';

const categoryLabels = {
  pricing: 'Giá cả', workflow: 'Quy trình', customer: 'Khách hàng',
  hr: 'Nhân sự', policy: 'Chính sách', other: 'Khác'
};

const categoryColors = {
  pricing: 'bg-green-100 text-green-700', workflow: 'bg-blue-100 text-blue-700',
  customer: 'bg-purple-100 text-purple-700', hr: 'bg-orange-100 text-orange-700',
  policy: 'bg-red-100 text-red-700', other: 'bg-gray-100 text-gray-700'
};

export default function DecisionMemoryPanel({ refreshKey }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadMemories(); }, [refreshKey, filter]);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/decisions/memory?category=${filter}`);
      setMemories(res.data.memories);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditForm({ decision: m.decision, reasoning: m.reasoning || '', category: m.category, tags: m.tags || '' });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/decisions/memory/${id}`, editForm);
      setEditingId(null);
      loadMemories();
    } catch (err) { console.error(err); }
  };

  const deleteMemory = async (id) => {
    try {
      await api.put(`/decisions/memory/${id}`, { active: false });
      loadMemories();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Đang tải...</div>;

  return (
    <div className="p-4 space-y-3">
      {/* Filter */}
      <div className="flex items-center gap-2 mb-2">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
        >
          <option value="all">Tất cả</option>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="text-xs text-gray-500">{memories.length} quyết định đã lưu</span>
      </div>

      {memories.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🧠</div>
          <p className="text-gray-500 text-sm">Chưa có quyết định nào được lưu</p>
          <p className="text-gray-400 text-xs mt-1">AI sẽ học khi bạn trả lời các câu hỏi</p>
        </div>
      )}

      {memories.map(m => {
        const isExpanded = expandedId === m.id;
        const isEditing = editingId === m.id;

        return (
          <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <button
              onClick={() => { setExpandedId(isExpanded ? null : m.id); setEditingId(null); }}
              className="w-full text-left px-4 py-3"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">🧠</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[m.category] || categoryColors.other}`}>
                      {categoryLabels[m.category] || m.category}
                    </span>
                    <span className="text-xs text-gray-400">Dùng {m.used_count} lần</span>
                    {m.tags && (
                      <span className="text-xs text-gray-400">| {m.tags}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-1">{m.situation}</p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5 line-clamp-1">→ {m.decision}</p>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0">{isExpanded ? '▼' : '▶'}</span>
              </div>
            </button>

            {/* Expanded */}
            {isExpanded && (
              <div className="border-t px-4 py-3 space-y-3 bg-gray-50/50">
                {!isEditing ? (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tình huống</label>
                      <p className="text-sm text-gray-800 mt-1">{m.situation}</p>
                    </div>
                    {m.question && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Câu hỏi</label>
                        <p className="text-sm text-gray-800 mt-1">{m.question}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Quyết định</label>
                      <p className="text-sm text-gray-800 mt-1 bg-blue-50 rounded-lg p-3 border border-blue-200">{m.decision}</p>
                    </div>
                    {m.reasoning && (
                      <div>
                        <label className="text-xs font-medium text-amber-600 uppercase tracking-wide">Lý do giải thích</label>
                        <p className="text-sm text-gray-800 mt-1 bg-amber-50 rounded-lg p-3 border border-amber-200">{m.reasoning}</p>
                      </div>
                    )}
                    {!m.reasoning && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-700">
                          Chưa có lý do giải thích. Thêm lý do giúp AI hiểu sâu hơn và áp dụng chính xác hơn.
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Bởi: {m.decided_by_name || 'N/A'}</span>
                      <span>|</span>
                      <span>{formatDateTime(m.created_at)}</span>
                      <span>|</span>
                      <span>Dùng {m.used_count} lần</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => startEdit(m)}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Sửa quyết định
                      </button>
                      <button
                        onClick={() => deleteMemory(m.id)}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Quyết định</label>
                      <textarea
                        value={editForm.decision}
                        onChange={e => setEditForm(prev => ({ ...prev, decision: e.target.value }))}
                        rows={2}
                        className="w-full mt-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-amber-600 uppercase tracking-wide">Lý do giải thích</label>
                      <textarea
                        value={editForm.reasoning}
                        onChange={e => setEditForm(prev => ({ ...prev, reasoning: e.target.value }))}
                        placeholder="Giải thích tại sao quyết định như vậy..."
                        rows={3}
                        className="w-full mt-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={editForm.category}
                        onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        className="text-sm border rounded-lg px-2 py-1.5"
                      >
                        {Object.entries(categoryLabels).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <input
                        value={editForm.tags}
                        onChange={e => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="Tags..."
                        className="flex-1 text-sm border rounded-lg px-2 py-1.5"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(m.id)}
                        className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
