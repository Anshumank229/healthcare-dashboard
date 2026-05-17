import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaRobot,
  FaCog,
  FaBell,
  FaMoon,
  FaSun,
  FaSearch,
  FaChevronLeft,
  FaHeartbeat,
  FaUserCircle,
} from 'react-icons/fa';

const menuItems = [
  { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
  { path: '/patients', icon: FaUsers, label: 'Patients' },
  { path: '/appointments', icon: FaCalendarAlt, label: 'Appointments' },
  { path: '/calendar', icon: FaChartLine, label: 'Calendar' },
  { path: '/predictions', icon: FaRobot, label: 'AI Predictions' },
  { path: '/settings', icon: FaCog, label: 'Settings' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard';
  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-64';

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
          bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800
          ${sidebarWidth}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center h-16 border-b border-surface-100 dark:border-surface-800 ${sidebarCollapsed ? 'justify-center px-2' : 'px-5'}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-healthcare-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <FaHeartbeat className="text-white" size={18} />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-surface-900 dark:text-surface-100 tracking-tight truncate">MedFlow</h1>
                  <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wider">Healthcare</p>
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 rounded-xl transition-all duration-200 group
                    ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'}
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-semibold shadow-sm'
                      : 'text-surface-500 hover:bg-surface-100 hover:text-surface-800 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200'
                    }
                  `}
                >
                  <item.icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'group-hover:text-primary-500'}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="text-sm truncate">{item.label}</span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse toggle (desktop only) */}
          <div className="hidden lg:block px-3 py-2 border-t border-surface-100 dark:border-surface-800">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300 transition-colors"
            >
              <FaChevronLeft
                size={14}
                className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              />
              {!sidebarCollapsed && <span className="text-xs font-medium">Collapse</span>}
            </button>
          </div>

          {/* User section */}
          <div className={`border-t border-surface-100 dark:border-surface-800 p-3 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
            {sidebarCollapsed ? (
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2.5 rounded-xl text-surface-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
              >
                <FaSignOutAlt size={16} />
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-healthcare-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {(user?.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">{user?.email || 'User'}</p>
                    <p className="text-xs text-surface-400 truncate">Professional</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-surface-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 text-sm"
                >
                  <FaSignOutAlt size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left: Mobile menu + Page title */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{currentPage}</h2>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                  className="p-2.5 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200 relative"
                >
                  <FaBell size={16} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-900" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-glass-lg border border-surface-200 dark:border-surface-700 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                      <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {[
                        { title: 'New appointment booked', time: '2 min ago', type: 'info' },
                        { title: 'Patient record updated', time: '15 min ago', type: 'success' },
                        { title: 'High no-show risk detected', time: '1 hour ago', type: 'warning' },
                      ].map((n, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors border-b border-surface-50 dark:border-surface-700/50 last:border-0">
                          <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{n.title}</p>
                          <p className="text-xs text-surface-400 mt-0.5">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-surface-100 dark:border-surface-700 text-center">
                      <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">View all notifications</button>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-healthcare-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(user?.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300 hidden sm:block">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-glass-lg border border-surface-200 dark:border-surface-700 overflow-hidden animate-scale-in">
                    <button
                      onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <FaCog size={14} /> Settings
                    </button>
                    <button
                      onClick={() => { handleLogout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FaSignOutAlt size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
