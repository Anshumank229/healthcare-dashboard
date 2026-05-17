import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaCalendarAlt, FaChartBar, FaRobot, FaSignOutAlt } from 'react-icons/fa';

const navItems = [
    { path: '/dashboard',    label: 'Dashboard',     icon: FaHome },
    { path: '/patients',     label: 'Patients',       icon: FaUsers },
    { path: '/appointments', label: 'Appointments',   icon: FaCalendarAlt },
    { path: '/analytics',    label: 'Analytics',      icon: FaChartBar },
    { path: '/predictions',  label: 'AI Predictions', icon: FaRobot },
];

export default function Layout() {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* ── Desktop Sidebar ───────────────────────────────────── */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col sticky top-0 h-screen">
                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg">
                            🏥
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Healthcare</h1>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <item.icon size={18} className={isActive ? 'text-blue-600' : ''} />
                                {item.label}
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 text-sm font-bold">
                                {(user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.email || 'User'}</p>
                            <p className="text-xs text-gray-500">Healthcare Professional</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                        <FaSignOutAlt size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Right side (mobile header + content + mobile nav) ─── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Mobile Top Header */}
                <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm">
                            🏥
                        </div>
                        <span className="font-bold text-gray-900">Healthcare</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="Logout"
                        >
                            <FaSignOutAlt size={16} />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="
                        px-4 py-4
                        pt-20
                        md:pt-8 md:px-8
                        pb-24 md:pb-8
                        max-w-7xl mx-auto
                        min-h-screen
                    ">
                        <Outlet />
                    </div>
                </main>

                {/* ── Mobile Bottom Navigation ──────────────────────── */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex shadow-lg">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs font-medium transition-colors ${
                                    isActive
                                        ? 'text-blue-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <item.icon size={20} />
                                <span className="truncate w-full text-center px-1">
                                    {item.label === 'AI Predictions' ? 'AI' : item.label}
                                </span>
                                {isActive && (
                                    <span className="absolute top-0 w-8 h-0.5 bg-blue-600 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}