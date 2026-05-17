export function SkeletonLine({ className = '', width = 'w-full' }) {
  return <div className={`skeleton h-4 rounded ${width} ${className}`} />;
}

export function SkeletonCircle({ size = 'w-10 h-10' }) {
  return <div className={`skeleton rounded-full ${size}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-100 dark:border-surface-700 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <SkeletonLine width="w-24" />
          <SkeletonLine width="w-16" className="h-7" />
        </div>
        <SkeletonCircle size="w-11 h-11" />
      </div>
      <SkeletonLine width="w-20" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr className="border-t border-surface-100 dark:border-surface-700">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonLine width={i === 0 ? 'w-32' : i === cols - 1 ? 'w-16' : 'w-24'} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </div>
  );
}
