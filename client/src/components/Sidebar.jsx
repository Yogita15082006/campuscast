import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiCompass, FiClipboard, FiUsers, FiCheckSquare, FiAward, FiBell, FiMessageSquare, FiPieChart } from 'react-icons/fi';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: FiGrid },
    { name: 'Browse Events', path: '/events', icon: FiCompass },
    { name: 'Registrations', path: '/registrations', icon: FiClipboard },
    { name: 'My Teams', path: '/teams', icon: FiUsers },
    { name: 'Attendance', path: '/attendance', icon: FiCheckSquare },
    { name: 'Certificates', path: '/certificates', icon: FiAward },
    { name: 'Announcements', path: '/announcements', icon: FiBell },
    { name: 'Feedback', path: '/feedback', icon: FiMessageSquare },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiPieChart },
    { name: 'Manage Events', path: '/admin/events', icon: FiCompass },
    { name: 'Manage Teams', path: '/admin/teams', icon: FiUsers },
    { name: 'Live Attendance', path: '/admin/attendance', icon: FiCheckSquare },
    { name: 'Announcements', path: '/announcements', icon: FiBell },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  // For the active indicator dot on Announcements
  const hasUnread = true; // Placeholder for unread badge logic

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 xl:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed xl:static top-0 left-0 h-full w-64 bg-white dark:bg-[var(--color-dark-card)] z-30
        transform transition-transform duration-300 ease-in-out border-r border-gray-100 dark:border-[var(--color-dark-border)]
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
              ((•))
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                CampusCast
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                ✨ {user?.role === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            // Match exactly or start with for highlighting
            const isActive = location.pathname === link.path ||
              (link.path !== '/' && location.pathname.startsWith(`${link.path}/`) && link.path !== '/events') ||
              (link.path === '/events' && location.pathname === '/events');

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => window.innerWidth < 1280 && closeSidebar()}
                className={`
                  relative flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-70'} />
                  {link.name}
                </div>

                {/* Notification dot for announcements */}
                {link.name === 'Announcements' && hasUnread && !isActive && (
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile Widget at bottom */}
        <div className="p-4 border-t border-gray-100 dark:border-[var(--color-dark-border)]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
            <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
