import { useState } from 'react';

const workflows = [
  {
    id: 'main',
    title: 'Luồng đơn hàng chính',
    description: 'Từ khi khách liên hệ đến khi thu tiền',
    steps: [
      { status: 'pending', label: 'Tiếp nhận', dept: 'CSKH', icon: '📞', desc: 'Khách liên hệ → CSKH tạo KH + đơn hàng', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
      { status: 'survey_scheduled', label: 'Hẹn khảo sát', dept: 'CSKH', icon: '📅', desc: 'Check lịch thợ → Hẹn ngày giờ khảo sát', color: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
      { status: 'surveyed', label: 'Khảo sát', dept: 'Thi công', icon: '🔍', desc: 'Thợ đi khảo sát → Báo vật tư + đề xuất thi công', color: 'bg-indigo-100 border-indigo-300 text-indigo-800' },
      { status: 'quoted', label: 'Báo giá', dept: 'CSKH', icon: '💲', desc: 'Lên báo giá (vật tư + nhân công) → Gửi khách', color: 'bg-orange-100 border-orange-300 text-orange-800' },
      { status: 'confirmed', label: 'Chốt đơn', dept: 'CSKH', icon: '✅', desc: 'Khách đồng ý → Xác nhận lịch thi công', color: 'bg-blue-100 border-blue-300 text-blue-800' },
      { status: 'in_progress', label: 'Thi công', dept: 'Thi công', icon: '🔧', desc: 'Đội thi công thực hiện theo lịch', color: 'bg-purple-100 border-purple-300 text-purple-800' },
      { status: 'completed', label: 'Hoàn thành', dept: 'Thi công', icon: '🎉', desc: 'Hoàn thành → Thông báo CSKH + Kế toán', color: 'bg-green-100 border-green-300 text-green-800' },
      { status: 'paid', label: 'Thu tiền', dept: 'CSKH/KT', icon: '💰', desc: 'CSKH thu tiền → Kế toán ghi nhận → Xong', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
    ]
  },
  {
    id: 'notification',
    title: 'Luồng thông báo tự động',
    description: 'Hệ thống tự động thông báo khi có thay đổi',
    items: [
      { trigger: 'Đơn mới tạo', notify: ['Thi công: "Cần hẹn khảo sát"'], icon: '📋' },
      { trigger: 'Khảo sát xong', notify: ['CSKH: "Vui lòng lên báo giá"'], icon: '🔍' },
      { trigger: 'Khách chốt đơn', notify: ['Thi công: "Lịch thi công mới"', 'Giám đốc: "Đơn đã chốt"'], icon: '✅' },
      { trigger: 'Bắt đầu thi công', notify: ['CSKH: "Đang thi công"', 'Giám đốc: "Đã bắt đầu"'], icon: '🔧' },
      { trigger: 'Hoàn thành', notify: ['CSKH: "Thu tiền KH"', 'Kế toán: "Xuất hóa đơn"', 'Giám đốc: "Đã xong"'], icon: '🎉' },
      { trigger: 'Đã thu tiền', notify: ['Kế toán: "Ghi nhận thu"', 'Giám đốc: "Thu tiền xong"'], icon: '💰' },
    ]
  },
  {
    id: 'ai_learning',
    title: 'Luồng AI tự học',
    description: 'AI học từ quyết định của Giám đốc',
    steps: [
      { label: 'Gặp tình huống mới', icon: '❓', desc: 'Nhân viên hỏi AI → AI không biết cách xử lý', color: 'bg-gray-100 border-gray-300 text-gray-800' },
      { label: 'Tìm tiền lệ', icon: '🔍', desc: 'AI tìm trong bộ nhớ quyết định đã lưu', color: 'bg-blue-100 border-blue-300 text-blue-800' },
      { label: 'Hỏi Giám đốc', icon: '👔', desc: 'Không tìm thấy → Gửi câu hỏi cho Giám đốc', color: 'bg-amber-100 border-amber-300 text-amber-800' },
      { label: 'GĐ trả lời + giải thích', icon: '💡', desc: 'Giám đốc quyết định + giải thích lý do', color: 'bg-green-100 border-green-300 text-green-800' },
      { label: 'Lưu bộ nhớ', icon: '🧠', desc: 'Lưu quyết định + lý do → AI áp dụng lần sau', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    ]
  }
];

export default function WorkflowPanel() {
  const [expandedId, setExpandedId] = useState('main');

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs text-gray-500 mb-2">
        Tổng quan các luồng công việc trong hệ thống
      </div>

      {workflows.map(wf => {
        const isExpanded = expandedId === wf.id;
        return (
          <div key={wf.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpandedId(isExpanded ? null : wf.id)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
            >
              <span className="text-lg">{wf.id === 'main' ? '🔄' : wf.id === 'notification' ? '🔔' : '🧠'}</span>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800">{wf.title}</div>
                <div className="text-xs text-gray-500">{wf.description}</div>
              </div>
              <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
            </button>

            {isExpanded && (
              <div className="border-t px-4 py-4">
                {/* Main workflow & AI learning - step flow */}
                {wf.steps && (
                  <div className="space-y-0">
                    {wf.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${step.color}`}>
                            {step.icon}
                          </div>
                          {i < wf.steps.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 my-1"></div>
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{step.label}</span>
                            {step.dept && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{step.dept}</span>
                            )}
                            {step.status && (
                              <span className="text-xs text-gray-400">[{step.status}]</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notification flow */}
                {wf.items && (
                  <div className="space-y-3">
                    {wf.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{item.trigger}</div>
                          <div className="mt-1 space-y-0.5">
                            {item.notify.map((n, j) => (
                              <div key={j} className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="text-blue-400">→</span> {n}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
