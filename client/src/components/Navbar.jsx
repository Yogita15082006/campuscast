import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMenu, FiMoon, FiSun, FiBell, FiSearch, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/events')) return 'Events';
    if (path.includes('/registrations')) return 'Registrations';
    if (path.includes('/teams')) return 'My Teams';
    if (path.includes('/attendance')) return 'Attendance';
    if (path.includes('/certificates')) return 'Certificates';
    if (path.includes('/announcements')) return 'Announcements';
    if (path.includes('/feedback')) return 'Feedback';
    return '';
  };

  return (
    <nav className="h-20 flex items-center justify-between px-4 lg:px-8 w-full sticky top-0 bg-gray-50 dark:bg-[var(--color-dark-bg)] z-20">

      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg xl:hidden hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <FiMenu size={24} />
        </button>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden md:block w-40">
          {getPageTitle()}
        </h1>

        {/* Global Search Bar */}
        <div className="hidden sm:flex relative max-w-md w-full ml-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-none rounded-xl bg-gray-200 dark:bg-[var(--color-dark-card)] text-sm placeholder-gray-500 focus:ring-0 focus:outline-none text-gray-900 dark:text-white font-medium"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
        >
          {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        <button className="p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors relative">
          <FiBell size={18} />
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-50 dark:border-[var(--color-dark-bg)]"></div>
        </button>

        {user && (
          <div className="relative ml-2">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1 pl-2 pr-3 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start pr-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </span>
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[var(--color-dark-card)] rounded-xl shadow-xl border border-gray-100 dark:border-[var(--color-dark-border)] py-1 z-20">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--color-dark-border)]">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 font-medium"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
