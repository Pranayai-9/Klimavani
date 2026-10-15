import React from 'react';
import { ArrowUpDown, SlidersHorizontal, RefreshCw, Radio } from 'lucide-react';
import { ClimateCategory, SortOrder } from '../../types/news';
import { CATEGORIES } from '../../data/mockArticles';

interface FilterControlsProps {
  activeCategory: ClimateCategory;
  onSelectCategory: (category: ClimateCategory) => void;
  sortBy: SortOrder;
  onChangeSort: (sort: SortOrder) => void;
  totalResults: number;
  totalArticles: number;
  isLive?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  lastUpdated?: string;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  activeCategory,
  onSelectCategory,
  sortBy,
  onChangeSort,
  totalResults,
  totalArticles,
  isLive = false,
  isRefreshing = false,
  onRefresh,
}) => {
  return (
    <div className="py-4 border-b border-forest-900/10 mb-8">
      {/* Category Buttons Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none no-scrollbar">
        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-800/60 mr-1 flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 border ${
                isActive
                  ? 'bg-forest-900 text-paper-100 border-forest-900 shadow-sm'
                  : 'bg-white/80 hover:bg-white text-charcoal-800 border-forest-900/15 hover:border-forest-900/40'
              } focus:outline-none focus:ring-1 focus:ring-forest-800`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Meta Bar: Results count + Sort options */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-charcoal-800/70 border-t border-forest-900/5">
        <div className="font-serif italic">
          Showing <span className="font-semibold text-forest-950 font-sans not-italic">{totalResults}</span> of{' '}
          <span className="font-semibold text-forest-950 font-sans not-italic">{totalArticles}</span> dispatches
          {activeCategory !== 'All News' && (
            <span> in <span className="font-semibold text-forest-900 font-sans not-italic">"{activeCategory}"</span></span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Live Pipeline Indicator & Refresh Action */}
          <div className="flex items-center gap-1.5 border-r border-forest-900/15 pr-3">
            <span className="flex items-center gap-1 text-[11px] font-medium text-forest-800">
              <Radio className={`w-3 h-3 ${isLive ? 'text-forest-700 animate-pulse' : 'text-charcoal-800/40'}`} />
              <span className="hidden sm:inline">{isLive ? 'Live Collector Active' : 'Cached Archive'}</span>
            </span>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Refresh live feeds"
                title="Fetch latest verified feeds"
                className="p-1 text-forest-900 hover:text-forest-700 hover:bg-forest-100 disabled:opacity-50 transition-all focus:outline-none focus:ring-1 focus:ring-forest-800"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="flex items-center gap-1 uppercase tracking-wider font-semibold text-[11px] text-forest-900/80">
              <ArrowUpDown className="w-3 h-3" />
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onChangeSort(e.target.value as SortOrder)}
              className="bg-white border border-forest-900/20 px-2.5 py-1 text-xs text-charcoal-900 font-medium focus:outline-none focus:ring-1 focus:ring-forest-800 cursor-pointer shadow-subtle"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Headline (A–Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
