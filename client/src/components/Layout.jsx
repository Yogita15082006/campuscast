import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { initSocket, disconnectSocket } from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socket = initSocket();

      socket.on('live_announcement', (data) => {
        toast((t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm text-primary-600">📢 Announcement: {data.eventTitle || 'General'}</span>
            <span className="text-sm dark:text-white text-gray-900">{data.message}</span>
          </div>
        ), { duration: 6000, icon: '🔔' });
      });

      return () => {
        socket.off('live_announcement');
        disconnectSocket();
      };
    }
  }, [user]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[var(--color-dark-bg)] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
