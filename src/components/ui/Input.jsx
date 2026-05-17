import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  containerClass = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={containerClass}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            <Icon size={16} />
          </div>
        )}
        <input
          type={inputType}
          className={`
            w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white
            text-surface-800 placeholder:text-surface-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            transition-all duration-200
            dark:bg-surface-800 dark:border-surface-600 dark:text-surface-100
            dark:placeholder:text-surface-500 dark:focus:border-primary-400
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
