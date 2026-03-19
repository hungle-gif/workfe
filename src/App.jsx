import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import DirectorPage from './pages/DirectorPage';
import MyProfilePage from './pages/MyProfilePage';
import StaffManagePage from './pages/StaffManagePage';
import MaterialPricePage from './pages/MaterialPricePage';
import Sidebar from './components/shared/Sidebar';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('chat');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">❄️</div>
          <div className="text-gray-400">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const isDirector = user.department === 'director';

  return (
    <SocketProvider>
      <div className="h-screen flex">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 overflow-hidden">
          {currentPage === 'chat' && (isDirector ? <DirectorPage /> : <ChatPage />)}
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'profile' && <MyProfilePage />}
          {currentPage === 'staff' && isDirector && <StaffManagePage />}
          {currentPage === 'materials' && <MaterialPricePage />}
        </main>
      </div>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
