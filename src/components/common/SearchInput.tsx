import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search headlines, topics, regions...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className="absolute left-3.5 w-4 h-4 text-forest-800/60 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search articles"
        className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-forest-900/20 rounded-none focus:outline-none focus:ring-1 focus:ring-forest-800 focus:border-forest-800 placeholder:text-charcoal-800/40 text-charcoal-900 transition-colors shadow-subtle"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search input"
          className="absolute right-2.5 p-1 text-charcoal-800/50 hover:text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-forest-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
