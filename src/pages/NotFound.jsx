import { useNavigate } from 'react-router-dom';
import { FaHome, FaHeartbeat } from 'react-icons/fa';
import Button from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-healthcare-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <FaHeartbeat className="text-white" size={36} />
        </div>
        <h1 className="text-7xl font-bold gradient-text mb-2">404</h1>
        <h2 className="text-xl font-semibold text-surface-800 dark:text-surface-200 mb-2">Page Not Found</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button icon={FaHome} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
