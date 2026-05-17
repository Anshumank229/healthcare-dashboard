import { FaSearch, FaTimes } from 'react-icons/fa';

export default function SearchFilter({ searchValue, onSearchChange, placeholder = 'Search...', filters, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={14} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-800 
            placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            transition-all duration-200 text-sm
            dark:bg-surface-800 dark:border-surface-600 dark:text-surface-100 dark:placeholder:text-surface-500"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {filters?.map((filter) => (
        <select
          key={filter.key}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-700 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            dark:bg-surface-800 dark:border-surface-600 dark:text-surface-300 transition-all duration-200"
        >
          <option value="">{filter.placeholder || 'All'}</option>
          {filter.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
