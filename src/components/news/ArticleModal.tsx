import React, { useEffect } from 'react';
import { X, ExternalLink, Calendar, Globe, Clock, ShieldCheck } from 'lucide-react';
import { Article } from '../../types/news';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { formatArticleDate } from '../../utils/date';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (article) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [article, onClose]);

  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-article-title"
    >
      <div
        className="relative bg-paper-100 max-w-3xl w-full border border-forest-900/30 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-forest-950 text-paper-100 px-6 py-3 flex items-center justify-between border-b border-forest-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-forest-300">
              Editorial Dispatch
            </span>
            <span className="text-forest-600">/</span>
            <span className="text-xs font-semibold text-paper-200">
              {article.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-forest-300 hover:text-white hover:bg-forest-900 transition-colors focus:outline-none focus:ring-1 focus:ring-forest-400"
            aria-label="Close article modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-800/70 mb-4 pb-3 border-b border-forest-900/10">
            <span className="font-semibold text-forest-950 px-2 py-0.5 bg-forest-100 border border-forest-200">
              {article.sourceName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-forest-800" />
              {formatArticleDate(article.publishedAt)}
            </span>
            {article.geographicScope && (
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-forest-800" />
                {article.geographicScope}
              </span>
            )}
            {article.readTimeMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-forest-800" />
                {article.readTimeMinutes} min read
              </span>
            )}
          </div>

          {/* Main Headline */}
          <h2
            id="modal-article-title"
            className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 leading-tight mb-4"
          >
            {article.title}
          </h2>

          {/* Original Wire Headline attribution if distinct */}
          {article.originalHeadline && article.originalHeadline !== article.title && (
            <div className="bg-forest-50/70 border-l-2 border-forest-700 p-3 mb-6">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-forest-800 mb-0.5">
                Original Source Wire Headline:
              </p>
              <p className="text-xs text-charcoal-800/80 italic font-serif">
                "{article.originalHeadline}"
              </p>
            </div>
          )}

          {/* Main Image */}
          <div className="mb-6 overflow-hidden border border-forest-900/10 shadow-subtle">
            <ImageWithFallback
              src={article.imageUrl}
              alt={article.title}
              category={article.category}
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="p-2.5 bg-paper-200/80 text-[11px] text-charcoal-800/70 italic flex justify-between items-center border-t border-forest-900/10">
              <span>{article.category} · {article.geographicScope || 'Global'}</span>
              <span className="font-sans not-italic font-medium text-forest-900">Source: {article.sourceName}</span>
            </div>
          </div>

          {/* Source description excerpt, not a direct quotation. */}
          {article.editorialTeaser && (
            <div className="mb-4 border-b border-forest-900/10 pb-4">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-forest-800 mb-1">From the source description</p>
              <p className="text-base sm:text-lg font-serif italic text-forest-950/90 leading-relaxed">{article.editorialTeaser}</p>
            </div>
          )}

          {/* Full Summary Description */}
          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-charcoal-900 mb-8 font-sans">
            <p>{article.description}</p>
            <p className="text-charcoal-800/70 text-sm italic">
              This summary is drawn directly from the original source. For the complete article, methodology, and data, visit the publisher below.
            </p>
          </div>

          {/* Source Attribution & Direct External Link Section */}
          <div className="bg-paper-200 border border-forest-900/15 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-forest-900 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                Verified Source Attribution
              </div>
              <p className="text-xs text-charcoal-800/70">
                Reporting originally issued by <span className="font-semibold text-charcoal-900">{article.sourceName}</span>.
              </p>
            </div>

            <a
              href={article.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-900 hover:bg-forest-800 text-paper-100 text-xs font-semibold tracking-wider uppercase transition-colors shadow-subtle shrink-0 focus:outline-none focus:ring-2 focus:ring-forest-800 focus:ring-offset-2"
            >
              <span>Read Original Publication</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
