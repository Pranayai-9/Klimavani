import React from 'react';
import { Newspaper, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  searchQuery?: string;
  category?: string;
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  category,
  onReset,
}) => {
  return (
    <div className="border border-dashed border-forest-900/25 bg-paper-50 p-12 text-center my-8 max-w-2xl mx-auto shadow-subtle">
      <div className="w-12 h-12 mx-auto mb-4 bg-forest-100 rounded-full flex items-center justify-center text-forest-800">
        <Newspaper className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-serif font-bold text-forest-950 mb-2">
        No Dispatch Matches Your Selection
      </h3>
      <p className="text-sm text-charcoal-800/70 max-w-md mx-auto mb-6 leading-relaxed">
        We found no articles matching {searchQuery && <span className="font-semibold text-forest-900">"{searchQuery}"</span>}
        {searchQuery && category && category !== 'All News' && ' under '}
        {category && category !== 'All News' && <span className="font-semibold text-forest-900">"{category}"</span>}.
        Try adjusting your keywords or clearing the category filter.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-forest-900 text-paper-100 hover:bg-forest-800 text-xs font-semibold uppercase tracking-wider transition-colors shadow-subtle focus:outline-none focus:ring-2 focus:ring-forest-800 focus:ring-offset-2"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset All Filters
      </button>
    </div>
  );
};
