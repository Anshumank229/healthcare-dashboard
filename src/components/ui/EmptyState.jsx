import { FaInbox } from 'react-icons/fa';
import Button from './Button';

export default function EmptyState({ icon: Icon = FaInbox, title = 'No data found', description, action, actionLabel, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-700/50 mb-4">
        <Icon className="text-surface-400 dark:text-surface-500" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm">{description}</p>}
      {action && (
        <Button onClick={action} className="mt-4" size="sm">
          {actionLabel || 'Take Action'}
        </Button>
      )}
    </div>
  );
}
