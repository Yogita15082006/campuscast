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
            <span className="text-sm">{data.message}</span>
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
