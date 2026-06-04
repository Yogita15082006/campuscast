import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiCalendar, FiUsers, FiAward, FiBell, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: FiHome },
    { name: 'Events', path: '/events', icon: FiCalendar },
    { name: 'My Teams', path: '/teams', icon: FiUsers },
    { name: 'Certificates', path: '/certificates', icon: FiAward },
    { name: 'Announcements', path: '/announcements', icon: FiBell },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiBarChart2 },
    { name: 'Manage Events', path: '/admin/events', icon: FiCalendar },
    { name: 'Manage Teams', path: '/admin/teams', icon: FiUsers },
    { name: 'Live Attendance', path: '/admin/attendance', icon: FiCheckCircle },
    { name: 'Announcements', path: '/announcements', icon: FiBell },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-16 left-0 h-[calc(100vh-4rem)] w-64 glass-effect z-30
        transform transition-transform duration-300 ease-in-out border-r
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 h-full overflow-y-auto flex flex-col gap-2">
          <div className="mb-4 px-3 py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {user?.role === 'admin' ? 'Admin Menu' : 'Student Menu'}
            </p>
          </div>
          
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || 
                             (link.path !== '/events' && location.pathname.startsWith(link.path));
            
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => window.innerWidth < 1024 && closeSidebar()}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'text-primary-600 dark:text-primary-400' : ''} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
