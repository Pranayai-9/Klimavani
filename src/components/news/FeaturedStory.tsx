import React from 'react';
import { ArrowRight, Calendar, Globe, Clock } from 'lucide-react';
import { Article } from '../../types/news';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { formatArticleDate } from '../../utils/date';

interface FeaturedStoryProps {
  article: Article;
  onOpenArticle: (article: Article) => void;
}

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({ article, onOpenArticle }) => {
  return (
    <section className="mb-12 border-b-2 border-forest-950 pb-10" aria-label="Lead Story">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left Column: Editorial Headline & Lead Story Context (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between order-2 lg:order-1 pr-0 lg:pr-4 border-r-0 lg:border-r border-forest-900/15">
          <div>
            {/* Top Badge & Section */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-forest-900 text-paper-100 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 shadow-sm">
                Lead Story
              </span>
              <span className="text-forest-700 font-bold">•</span>
              <span className="text-xs uppercase font-bold tracking-wider text-forest-800">
                {article.category}
              </span>
            </div>

            {/* Prominent Editorial Headline */}
            <h2
              onClick={() => onOpenArticle(article)}
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-forest-950 leading-[1.18] tracking-tight hover:text-forest-800 transition-colors cursor-pointer mb-4"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onOpenArticle(article);
              }}
            >
              {article.title}
            </h2>

            {/* Editorial Snippet */}
            <p className="text-charcoal-800 text-sm sm:text-base leading-relaxed font-sans mb-4">
              {article.description}
            </p>

            {/* Editorial Teaser Quote */}
            {article.editorialTeaser && (
              <blockquote className="border-l-2 border-forest-800 pl-3 py-1 text-xs sm:text-sm font-serif italic text-forest-950/80 mb-6 bg-forest-50/50">
                "{article.editorialTeaser}"
              </blockquote>
            )}
          </div>

          {/* Bottom Attribution & Action */}
          <div className="pt-4 border-t border-forest-900/10">
            <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-800/70 mb-4">
              <span className="font-semibold text-forest-950 bg-paper-200 px-2 py-0.5 border border-forest-900/10">
                {article.sourceName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-forest-700" />
                {formatArticleDate(article.publishedAt)}
              </span>
              {article.geographicScope && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-forest-700" />
                  {article.geographicScope}
                </span>
              )}
              {article.readTimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-forest-700" />
                  {article.readTimeMinutes} min read
                </span>
              )}
            </div>

            <button
              onClick={() => onOpenArticle(article)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-900 hover:bg-forest-800 text-paper-100 text-xs font-bold tracking-wider uppercase transition-colors shadow-subtle group focus:outline-none focus:ring-2 focus:ring-forest-800 focus:ring-offset-2"
            >
              <span>Read Full Dispatch</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Column: Hero Photograph (7 cols on lg) */}
        <div
          className="lg:col-span-7 order-1 lg:order-2 cursor-pointer group flex flex-col"
          onClick={() => onOpenArticle(article)}
        >
          <div className="relative overflow-hidden border border-forest-900/20 shadow-editorial flex-1 min-h-[300px] sm:min-h-[400px]">
            <ImageWithFallback
              src={article.imageUrl}
              alt={article.title}
              category={article.category}
              className="w-full h-full min-h-[300px] sm:min-h-[400px] group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex justify-between items-end text-white text-xs">
              <span className="font-sans font-medium text-paper-200">
                Environmental Telemetry & Remote Sensing Record
              </span>
              <span className="font-mono text-[11px] opacity-80">
                Source: {article.sourceName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
