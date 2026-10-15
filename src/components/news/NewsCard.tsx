import React from 'react';
import { Calendar, Globe, ExternalLink } from 'lucide-react';
import { Article } from '../../types/news';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { formatArticleDate } from '../../utils/date';

interface NewsCardProps {
  article: Article;
  onOpenArticle: (article: Article) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onOpenArticle,
}) => {
  return (
    <article
      className="group bg-white/70 hover:bg-white border border-forest-900/15 flex flex-col justify-between transition-all duration-200 shadow-subtle hover:shadow-editorial h-full overflow-hidden"
      aria-labelledby={`article-title-${article.id}`}
    >
      <div>
        {/* Card Photograph */}
        <div
          className="relative aspect-[16/10] overflow-hidden border-b border-forest-900/10 cursor-pointer"
          onClick={() => onOpenArticle(article)}
        >
          <ImageWithFallback
            src={article.imageUrl}
            alt={article.title}
            category={article.category}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {article.isBreaking && (
              <span className="bg-crimson-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
                Breaking
              </span>
            )}
            <span className="bg-forest-950/85 backdrop-blur-xs text-paper-100 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 shadow-sm">
              {article.category}
            </span>
          </div>

          {article.geographicScope && (
            <div className="absolute bottom-2 right-2 bg-charcoal-900/80 backdrop-blur-xs text-paper-200 text-[10px] px-1.5 py-0.5 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" />
              <span>{article.geographicScope}</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5">
          {/* Source Attribution & Date */}
          <div className="flex items-center justify-between text-[11px] text-charcoal-800/70 mb-2.5">
            <span className="font-semibold text-forest-900 uppercase tracking-wider truncate max-w-[180px]">
              {article.sourceName}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3 h-3 text-forest-700" />
              {formatArticleDate(article.publishedAt)}
            </span>
          </div>

          {/* Headline */}
          <h3
            id={`article-title-${article.id}`}
            onClick={() => onOpenArticle(article)}
            className="text-lg sm:text-xl font-serif font-bold text-forest-950 leading-snug tracking-tight mb-2.5 group-hover:text-forest-800 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onOpenArticle(article);
            }}
          >
            {article.title}
          </h3>

          {/* Short Snippet */}
          <p className="text-xs sm:text-sm text-charcoal-800/80 leading-relaxed font-sans line-clamp-3 mb-4">
            {article.description}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-forest-900/10 flex items-center justify-between text-xs">
        <button
          onClick={() => onOpenArticle(article)}
          className="font-bold text-forest-900 hover:text-forest-700 uppercase tracking-wider text-[11px] hover:underline underline-offset-4 focus:outline-none focus:ring-1 focus:ring-forest-800"
        >
          Read Dispatch →
        </button>

        <a
          href={article.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-charcoal-800/60 hover:text-forest-900 p-1 transition-colors"
          title={`Open original source (${article.sourceName})`}
          aria-label={`Open original source: ${article.sourceName}`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};
