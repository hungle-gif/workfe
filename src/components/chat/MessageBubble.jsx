import ActionCard from './ActionCard';
import { formatDateTime } from '../../utils/format';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isUser ? 'bg-blue-600 text-white' : 'bg-blue-100'}`}>
        {isUser ? '👤' : '🤖'}
      </div>

      <div className={`max-w-[70%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-tr-md' : 'bg-white rounded-tl-md'}`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        </div>

        {/* Action cards */}
        {message.actions && message.actions.length > 0 && (
          <div className="space-y-2">
            {message.actions.map((action, i) => (
              <ActionCard key={i} action={action} />
            ))}
          </div>
        )}

        <div className={`text-xs text-gray-400 px-1 ${isUser ? 'text-right' : ''}`}>
          {formatDateTime(message.time)}
        </div>
      </div>
    </div>
  );
}
