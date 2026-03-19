import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getDeptLabel } from '../../utils/format';

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();

  const isDirector = user.department === 'director';

  const menuItems = [
    { id: 'chat', label: 'Chat AI', icon: '💬' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: '👤' },
    ...(isDirector ? [
      { id: 'staff', label: 'Quản lý nhân sự', icon: '👥' },
      { id: 'materials', label: 'Bảng giá vật tư', icon: '🔧' },
    ] : []),
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-3xl">❄️</span>
          <div>
            <h1 className="font-bold text-gray-800">HVAC System</h1>
            <p className="text-xs text-gray-400">Bắc Ninh</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
            {user.department === 'director' ? '👔' :
             user.department === 'accounting' ? '💼' :
             user.department === 'cskh' ? '🎧' : '👷'}
          </div>
          <div>
            <div className="font-medium text-gray-800 text-sm">{user.name}</div>
            <div className="text-xs text-gray-400">{getDeptLabel(user.department)}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              currentPage === item.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'chat' && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Notifications summary */}
      {unreadCount > 0 && (
        <div className="mx-3 mb-3 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-yellow-700">
            <span>🔔</span>
            <span>{unreadCount} thông báo mới</span>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span>🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
