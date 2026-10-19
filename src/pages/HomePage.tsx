import React, { useState } from 'react';
import { useNewsFilter } from '../hooks/useNewsFilter';
import { useNewsData } from '../hooks/useNewsData';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { BreakingTicker } from '../components/navigation/BreakingTicker';
import { FeaturedStory } from '../components/news/FeaturedStory';
import { NewsGrid } from '../components/news/NewsGrid';
import { FilterControls } from '../components/common/FilterControls';
import { ArticleModal } from '../components/news/ArticleModal';
import { Article } from '../types/news';

export const HomePage: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Live Data Pipeline integration
  const {
    articles,
    tickerItems,
    isLive,
    isLoading,
    isRefreshing,
    lastUpdated,
    refreshFeeds,
    error,
  } = useNewsData();

  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    featuredArticle,
    gridArticles,
    resetFilters,
    totalCount,
    initialCount,
  } = useNewsFilter({ articles });

  const handleTickerClick = (text: string) => {
    // Search or scroll to relevant items
    setSearchQuery(text.slice(0, 20));
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-100 text-charcoal-900 selection:bg-forest-100 selection:text-forest-900">
      {/* 1. Header and Masthead */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Breaking News Wire Ticker */}
      <BreakingTicker
        items={tickerItems}
        onSelectBreaking={handleTickerClick}
      />

      {/* Main Newspaper Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Filter Controls (Category Pills, Sorting, and Live Sync status) */}
        <FilterControls
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          sortBy={sortBy}
          onChangeSort={setSortBy}
          totalResults={totalCount}
          totalArticles={initialCount}
          isLive={isLive}
          isRefreshing={isRefreshing}
          onRefresh={refreshFeeds}
          lastUpdated={lastUpdated || undefined}
          error={error || undefined}
        />

        {/* Lead Featured Story (Rendered when we have articles and not in an empty state) */}
        {featuredArticle && (
          <FeaturedStory
            article={featuredArticle}
            onOpenArticle={setSelectedArticle}
          />
        )}

        {/* Latest News Grid */}
        <NewsGrid
          articles={gridArticles}
          onOpenArticle={setSelectedArticle}
          title={
            activeCategory === 'All News'
              ? 'Dispatches from Field & Laboratory'
              : `${activeCategory} Dispatches`
          }
          searchQuery={searchQuery}
          category={activeCategory}
          isLoading={isLoading}
          error={error || undefined}
          onResetFilters={resetFilters}
        />
      </main>

      {/* 3. Newspaper Footer */}
      <Footer onSelectCategory={setActiveCategory} />

      {/* 4. Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
};
