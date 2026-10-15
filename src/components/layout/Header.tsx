import React, { useState } from 'react';
import { Menu, X, Globe, Calendar, Search } from 'lucide-react';
import { formatMastheadDate } from '../../utils/date';
import { ClimateCategory } from '../../types/news';
import { CATEGORIES } from '../../data/mockArticles';

interface HeaderProps {
  activeCategory: ClimateCategory;
  onSelectCategory: (category: ClimateCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchVisibleMobile, setIsSearchVisibleMobile] = useState(false);
  const currentDate = formatMastheadDate();

  return (
    <header className="bg-paper-100 text-charcoal-900 border-b border-forest-900/15">
      {/* Top Meta Bar */}
      <div className="border-b border-forest-900/10 py-1.5 px-4 sm:px-6 lg:px-8 text-[11px] font-sans text-charcoal-800/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wider uppercase text-forest-900">Vol. I • No. 1</span>
            <span className="hidden sm:inline text-forest-800/40">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-forest-700" />
              {currentDate}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-charcoal-800/70">
            <span className="hidden md:inline font-mono text-[10px] bg-forest-100/70 text-forest-900 px-2 py-0.5 border border-forest-200">
              CO₂ Benchmark: 426.2 ppm
            </span>
            <div className="flex items-center gap-1 font-medium">
              <Globe className="w-3 h-3 text-forest-700" />
              <span>Global Digital Edition</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 text-center">
        <div className="newspaper-double-line mb-4" />
        
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight text-forest-950 uppercase hover:opacity-95 transition-opacity cursor-pointer">
            <a href="/" className="focus:outline-none focus:ring-2 focus:ring-forest-800">
              Klimavani
            </a>
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-serif italic tracking-wide text-forest-900/90 font-medium">
            Climate, Environment & The Changing World
          </p>
        </div>

        <div className="newspaper-double-line mt-4" />
      </div>

      {/* Primary Navigation Bar */}
      <nav
        aria-label="Primary Navigation"
        className="bg-paper-200/90 backdrop-blur-sm border-t border-b border-forest-900/20 sticky top-0 z-30 shadow-subtle"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-forest-950 hover:bg-forest-100 focus:outline-none focus:ring-1 focus:ring-forest-800"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Desktop Categories List */}
          <div className="hidden sm:flex items-center gap-1 md:gap-3 overflow-x-auto py-1 scrollbar-none">
            {CATEGORIES.slice(0, 7).map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-forest-950 border-b-2 border-forest-900 font-bold'
                      : 'text-charcoal-800/80 hover:text-forest-950 hover:bg-paper-300/40'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Bar / Search Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-forest-900/60" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search archive..."
                aria-label="Search articles in header"
                className="w-full pl-8 pr-3 py-1 text-xs bg-white/90 border border-forest-900/25 rounded-none text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-forest-800 focus:border-forest-800"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsSearchVisibleMobile(!isSearchVisibleMobile)}
              className="md:hidden p-1.5 text-forest-900 hover:bg-forest-100"
              aria-label="Toggle search box"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isSearchVisibleMobile && (
          <div className="md:hidden p-3 bg-paper-100 border-t border-forest-900/10">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Klimavani archive..."
              className="w-full px-3 py-2 text-xs bg-white border border-forest-900/30 rounded-none focus:outline-none focus:ring-1 focus:ring-forest-800"
              autoFocus
            />
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-paper-100 border-b border-forest-900/20 px-4 pt-2 pb-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-forest-800/60 pb-1 mb-1 border-b border-forest-900/10">
              Publication Sections
            </p>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-forest-900 text-paper-100 font-semibold'
                      : 'text-charcoal-800 hover:bg-forest-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
};
