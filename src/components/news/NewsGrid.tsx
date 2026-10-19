import React from 'react';
import { Article } from '../../types/news';
import { NewsCard } from './NewsCard';
import { EmptyState } from '../common/EmptyState';

interface NewsGridProps {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  title?: string;
  searchQuery?: string;
  category?: string;
  isLoading?: boolean;
  error?: string;
  onResetFilters: () => void;
}

export const NewsGrid: React.FC<NewsGridProps> = ({
  articles,
  onOpenArticle,
  title = 'Latest Global Dispatches',
  searchQuery,
  category,
  isLoading = false,
  error,
  onResetFilters,
}) => {
  if (articles.length === 0) {
    if (isLoading) {
      return <p className="py-16 text-center text-sm text-charcoal-800/70" role="status">Loading the climate dispatch archive…</p>;
    }
    if (error) {
      return <p className="my-8 border border-red-900/20 bg-red-50 p-6 text-center text-sm text-red-900" role="alert">The article service is unavailable. {error}</p>;
    }
    if (!searchQuery?.trim() && (!category || category === 'All News')) {
      return <p className="my-8 border border-forest-900/15 bg-white/70 p-8 text-center text-sm text-charcoal-800/75">No dispatches are available yet. The archive will appear here after the first successful collection.</p>;
    }
    return (
      <EmptyState
        searchQuery={searchQuery}
        category={category}
        onReset={onResetFilters}
      />
    );
  }

  return (
    <section className="mb-16" aria-label="Latest News Grid">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-forest-900">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-950 uppercase tracking-tight">
          {title}
        </h2>
        <span className="text-xs uppercase tracking-wider font-semibold text-charcoal-800/70 font-sans">
          Curated Editorial Selection
        </span>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
        {articles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onOpenArticle={onOpenArticle}
          />
        ))}
      </div>
    </section>
  );
};
