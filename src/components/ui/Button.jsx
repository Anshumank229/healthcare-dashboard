import { FaSpinner } from 'react-icons/fa';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md active:bg-primary-800',
  secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:bg-red-800',
  ghost: 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <FaSpinner className="animate-spin" size={size === 'sm' ? 12 : 14} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight size={size === 'sm' ? 12 : 14} />}
    </button>
  );
}
