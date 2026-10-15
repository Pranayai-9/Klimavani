import { useState, useMemo } from 'react';
import { Article, ClimateCategory, SortOrder } from '../types/news';

interface UseNewsFilterOptions {
  articles: Article[];
}

export function useNewsFilter({ articles }: UseNewsFilterOptions) {
  const [activeCategory, setActiveCategory] = useState<ClimateCategory>('All News');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOrder>('newest');

  const filteredAndSortedArticles = useMemo(() => {
    let result = [...articles];

    // 1. Filter by category
    if (activeCategory !== 'All News') {
      result = result.filter((item) => item.category === activeCategory);
    }

    // 2. Filter by search query across multiple fields
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const teaserMatch = item.editorialTeaser?.toLowerCase().includes(query);
        const sourceMatch = item.sourceName.toLowerCase().includes(query);
        const geoMatch = item.geographicScope?.toLowerCase().includes(query);
        const categoryMatch = item.category.toLowerCase().includes(query);

        return (
          titleMatch ||
          descMatch ||
          teaserMatch ||
          sourceMatch ||
          geoMatch ||
          categoryMatch
        );
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [articles, activeCategory, searchQuery, sortBy]);

  // Lead Featured Story:
  // When browsing "All News" without an active search, pick the explicitly marked featured story.
  // Otherwise, use the top result as lead story and remainder for the grid.
  const featuredArticle = useMemo(() => {
    if (filteredAndSortedArticles.length === 0) return null;

    if (activeCategory === 'All News' && !searchQuery.trim()) {
      const explicitFeatured = filteredAndSortedArticles.find((a) => a.isFeatured);
      return explicitFeatured || filteredAndSortedArticles[0];
    }

    return filteredAndSortedArticles[0];
  }, [filteredAndSortedArticles, activeCategory, searchQuery]);

  // Remaining articles for grid (excluding the featured one to prevent visual duplication)
  const gridArticles = useMemo(() => {
    if (!featuredArticle) return [];
    return filteredAndSortedArticles.filter((item) => item.id !== featuredArticle.id);
  }, [filteredAndSortedArticles, featuredArticle]);

  const resetFilters = () => {
    setActiveCategory('All News');
    setSearchQuery('');
    setSortBy('newest');
  };

  return {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredArticles: filteredAndSortedArticles,
    featuredArticle,
    gridArticles,
    resetFilters,
    totalCount: filteredAndSortedArticles.length,
    initialCount: articles.length,
  };
}
