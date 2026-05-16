import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaCalendarAlt, 
  FaChartLine, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserMd,
  FaRobot
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const menuItems = [
  { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
  { path: '/patients', icon: FaUsers, label: 'Patients' },
  { path: '/appointments', icon: FaCalendarAlt, label: 'Appointments' },
  { path: '/analytics', icon: FaChartLine, label: 'Analytics' },
  { path: '/predictions', icon: FaRobot, label: 'AI Predictions' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <aside className={ixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-blue-800 to-blue-900 transition-transform duration-300 ease-in-out }>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-8">
            <FaUserMd className="text-white text-3xl" />
            <h1 className="text-white text-xl font-bold">Healthcare</h1>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 rounded-lg hover:bg-white/10 transition group"
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-5 border-t border-white/10">
          <div className="mb-3 px-2">
            <p className="text-white text-sm">{user.email || 'User'}</p>
            <p className="text-gray-300 text-xs">Healthcare Professional</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 rounded-lg hover:bg-red-600/20 transition"
          >
            <FaSignOutAlt size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
