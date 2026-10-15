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
  onResetFilters: () => void;
}

export const NewsGrid: React.FC<NewsGridProps> = ({
  articles,
  onOpenArticle,
  title = 'Latest Global Dispatches',
  searchQuery,
  category,
  onResetFilters,
}) => {
  if (articles.length === 0) {
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
