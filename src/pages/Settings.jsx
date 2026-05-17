import { FaCog, FaUser, FaPalette, FaBell, FaShieldAlt, FaMoon, FaSun, FaEnvelope } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ContentCard } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Settings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <ContentCard>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-healthcare-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">
              {(user?.email || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Profile</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FaEnvelope size={14} className="text-surface-400" />
                <span className="text-surface-700 dark:text-surface-300">{user?.email || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaShieldAlt size={14} className="text-surface-400" />
                <span className="text-surface-700 dark:text-surface-300">Healthcare Professional</span>
              </div>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Appearance */}
      <ContentCard>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <FaPalette className="text-primary-500" size={18} /> Appearance
        </h3>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-surface-800 dark:text-surface-200">Dark Mode</p>
            <p className="text-sm text-surface-500 dark:text-surface-400">Toggle between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
              isDark ? 'bg-primary-600' : 'bg-surface-300'
            }`}
          >
            <span
              className={`inline-flex items-center justify-center h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            >
              {isDark ? <FaMoon size={10} className="text-primary-600" /> : <FaSun size={10} className="text-amber-500" />}
            </span>
          </button>
        </div>
      </ContentCard>

      {/* Notifications */}
      <ContentCard>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <FaBell className="text-primary-500" size={18} /> Notifications
        </h3>
        <div className="space-y-3">
          {[
            { title: 'Email Notifications', desc: 'Receive email alerts for appointments' },
            { title: 'No-Show Alerts', desc: 'Get notified about high-risk appointments' },
            { title: 'Appointment Reminders', desc: 'Send reminders to patients via WhatsApp' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-surface-50 dark:border-surface-700/50 last:border-0">
              <div>
                <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">{item.title}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{item.desc}</p>
              </div>
              <button
                className="relative inline-flex h-6 w-10 items-center rounded-full bg-primary-600 transition-colors"
              >
                <span className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transform translate-x-5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </ContentCard>

      {/* Account */}
      <ContentCard>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <FaShieldAlt className="text-primary-500" size={18} /> Account & Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">Change Password</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Update your account password</p>
            </div>
            <Button variant="secondary" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Add an extra layer of security</p>
            </div>
            <Button variant="secondary" size="sm">Enable</Button>
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
