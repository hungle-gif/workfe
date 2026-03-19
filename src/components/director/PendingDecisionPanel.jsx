import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatDateTime } from '../../utils/format';

const categoryLabels = {
  pricing: 'Giá cả',
  workflow: 'Quy trình',
  customer: 'Khách hàng',
  hr: 'Nhân sự',
  policy: 'Chính sách',
  other: 'Khác'
};

const categoryColors = {
  pricing: 'bg-green-100 text-green-700',
  workflow: 'bg-blue-100 text-blue-700',
  customer: 'bg-purple-100 text-purple-700',
  hr: 'bg-orange-100 text-orange-700',
  policy: 'bg-red-100 text-red-700',
  other: 'bg-gray-100 text-gray-700'
};

export default function PendingDecisionPanel({ refreshKey, onRefresh }) {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [answerForm, setAnswerForm] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { loadDecisions(); }, [refreshKey, filter]);

  const loadDecisions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/decisions/pending?status=${filter}`);
      setDecisions(res.data.decisions);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAnswer = async (id) => {
    const form = answerForm[id];
    if (!form?.answer?.trim()) return;

    setSubmitting(id);
    try {
      await api.post(`/decisions/answer/${id}`, {
        answer: form.answer,
        reasoning: form.reasoning || '',
        category: form.category || 'other',
        tags: form.tags || ''
      });
      setAnswerForm(prev => { const n = { ...prev }; delete n[id]; return n; });
      setExpandedId(null);
      loadDecisions();
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally { setSubmitting(null); }
  };

  const updateForm = (id, field, value) => {
    setAnswerForm(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
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
          <option value="pending">Chờ trả lời</option>
          <option value="answered">Đã trả lời</option>
          <option value="all">Tất cả</option>
        </select>
        <span className="text-xs text-gray-500">{decisions.length} mục</span>
        <button onClick={loadDecisions} className="ml-auto text-xs text-blue-600 hover:text-blue-800">
          Làm mới
        </button>
      </div>

      {decisions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">{filter === 'pending' ? '✅' : '📋'}</div>
          <p className="text-gray-500 text-sm">
            {filter === 'pending' ? 'Không có quyết định nào đang chờ!' : 'Chưa có dữ liệu'}
          </p>
        </div>
      )}

      {decisions.map(d => {
        const isExpanded = expandedId === d.id;
        const form = answerForm[d.id] || {};
        const cat = d.context?.category || 'other';

        return (
          <div key={d.id} className={`bg-white rounded-xl shadow-sm border transition-all ${
            d.status === 'pending' ? 'border-amber-200' : 'border-gray-200'
          }`}>
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : d.id)}
              className="w-full text-left px-4 py-3"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">{d.status === 'pending' ? '⚡' : '✅'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[cat] || categoryColors.other}`}>
                      {categoryLabels[cat] || cat}
                    </span>
                    <span className="text-xs text-gray-400">#{d.id}</span>
                    {d.asked_by_name && (
                      <span className="text-xs text-gray-400">
                        bởi {d.asked_by_name}
                        {d.asked_by_dept && ` (${d.asked_by_dept})`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{d.question}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{d.situation}</p>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>
            </button>

            {/* Expanded Detail */}
            {isExpanded && (
              <div className="border-t px-4 py-3 space-y-3 bg-gray-50/50">
                {/* Situation detail */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tình huống</label>
                  <p className="text-sm text-gray-800 mt-1 bg-white rounded-lg p-3 border">{d.situation}</p>
                </div>

                {/* Question */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Câu hỏi</label>
                  <p className="text-sm text-gray-800 mt-1 bg-white rounded-lg p-3 border">{d.question}</p>
                </div>

                {/* Options if any */}
                {d.context?.options && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gợi ý phương án</label>
                    <div className="mt-1 space-y-1">
                      {(Array.isArray(d.context.options)
                        ? d.context.options
                        : String(d.context.options).split('\n').filter(s => s.trim())
                      ).map((opt, i) => {
                        const cleanOpt = String(opt).replace(/^\d+\.\s*/, '').trim();
                        return (
                          <button
                            key={i}
                            onClick={() => updateForm(d.id, 'answer', cleanOpt)}
                            className="block w-full text-left text-sm bg-white rounded-lg px-3 py-2 border hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            {i + 1}. {cleanOpt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Already answered */}
                {d.status === 'answered' && d.answer && (
                  <div>
                    <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Đã trả lời</label>
                    <p className="text-sm text-gray-800 mt-1 bg-green-50 rounded-lg p-3 border border-green-200">{d.answer}</p>
                  </div>
                )}

                {/* Answer form (only for pending) */}
                {d.status === 'pending' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        Quyết định của bạn *
                      </label>
                      <textarea
                        value={form.answer || ''}
                        onChange={e => updateForm(d.id, 'answer', e.target.value)}
                        placeholder="Nhập quyết định xử lý..."
                        rows={2}
                        className="w-full mt-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                        Giải thích lý do (giúp AI hiểu sâu hơn)
                      </label>
                      <textarea
                        value={form.reasoning || ''}
                        onChange={e => updateForm(d.id, 'reasoning', e.target.value)}
                        placeholder="Tại sao quyết định như vậy? AI sẽ học từ lý do này để áp dụng cho tình huống tương tự..."
                        rows={3}
                        className="w-full mt-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Tip: Giải thích càng chi tiết, AI càng áp dụng chính xác cho lần sau
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500">Phân loại</label>
                        <select
                          value={form.category || cat}
                          onChange={e => updateForm(d.id, 'category', e.target.value)}
                          className="w-full mt-1 text-sm border border-gray-300 rounded-lg px-2 py-1.5"
                        >
                          {Object.entries(categoryLabels).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500">Tags</label>
                        <input
                          value={form.tags || ''}
                          onChange={e => updateForm(d.id, 'tags', e.target.value)}
                          placeholder="vd: giảm giá, khách VIP"
                          className="w-full mt-1 text-sm border border-gray-300 rounded-lg px-2 py-1.5"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleAnswer(d.id)}
                      disabled={!form.answer?.trim() || submitting === d.id}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting === d.id ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          Trả lời & Lưu vào bộ nhớ AI
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="text-xs text-gray-400 pt-1">
                  Gửi lúc: {formatDateTime(d.created_at)}
                  {d.answered_at && ` | Trả lời lúc: ${formatDateTime(d.answered_at)}`}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
