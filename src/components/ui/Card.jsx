export function StatCard({ title, value, icon: Icon, trend, trendLabel, accentColor = 'teal', className = '' }) {
  return (
    <div className={`
      stat-accent stat-accent-${accentColor}
      bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card 
      hover:shadow-card-hover transition-all duration-300
      border border-surface-100 dark:border-surface-700
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs font-medium flex items-center gap-1 ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
              {trendLabel && <span className="text-surface-400 font-normal">{trendLabel}</span>}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`
            p-3 rounded-xl
            ${accentColor === 'teal' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : ''}
            ${accentColor === 'blue' ? 'bg-healthcare-50 text-healthcare-600 dark:bg-healthcare-900/30 dark:text-healthcare-400' : ''}
            ${accentColor === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : ''}
            ${accentColor === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : ''}
            ${accentColor === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : ''}
            ${accentColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
          `}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ContentCard({ title, action, children, className = '', noPadding = false }) {
  return (
    <div className={`
      bg-white dark:bg-surface-800 rounded-2xl shadow-card
      border border-surface-100 dark:border-surface-700
      transition-all duration-300 overflow-hidden
      ${className}
    `}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-700">
          {title && <h3 className="font-semibold text-surface-900 dark:text-surface-100">{title}</h3>}
          {action}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
