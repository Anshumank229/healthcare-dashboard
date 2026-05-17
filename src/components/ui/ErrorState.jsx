import { FaExclamationTriangle } from 'react-icons/fa';
import Button from './Button';

export default function ErrorState({ title = 'Something went wrong', message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 mb-4">
        <FaExclamationTriangle className="text-red-500 dark:text-red-400" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">{title}</h3>
      {message && <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-4">{message}</p>}
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}
