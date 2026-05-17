const colorMap = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({ children, color = 'neutral', size = 'md', dot = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${colorMap[color]} ${sizeMap[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current`} />}
      {children}
    </span>
  );
}

// Preset badges for appointment statuses
export function StatusBadge({ status }) {
  const statusConfig = {
    scheduled: { color: 'warning', label: 'Scheduled' },
    confirmed: { color: 'success', label: 'Confirmed' },
    cancelled: { color: 'danger', label: 'Cancelled' },
    completed: { color: 'neutral', label: 'Completed' },
    no_show: { color: 'orange', label: 'No Show' },
  };

  const config = statusConfig[status] || { color: 'neutral', label: status };
  return <Badge color={config.color} dot>{config.label}</Badge>;
}

export function RiskBadge({ risk }) {
  const riskConfig = {
    Low: { color: 'success' },
    Medium: { color: 'warning' },
    High: { color: 'danger' },
  };
  const config = riskConfig[risk] || { color: 'neutral' };
  return <Badge color={config.color} size="lg" dot>{risk} Risk</Badge>;
}
