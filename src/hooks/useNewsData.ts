import { useState, useEffect, useCallback } from 'react';
import { Article } from '../types/news';
import { MOCK_ARTICLES, BREAKING_TICKER_ITEMS } from '../data/mockArticles';
import { TickerItem } from '../components/navigation/BreakingTicker';

interface UseNewsDataReturn {
  articles: Article[];
  tickerItems: TickerItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLive: boolean;
  lastUpdated: string | null;
  error: string | null;
  refreshFeeds: () => Promise<void>;
}

export function useNewsData(): UseNewsDataReturn {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(BREAKING_TICKER_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchArticlesAndTicker = useCallback(async () => {
    try {
      // 1. Fetch articles from Express REST API
      const articlesRes = await fetch('/api/articles');
      if (articlesRes.ok) {
        const json = await articlesRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setArticles(json.data);
          setLastUpdated(json.lastUpdated || new Date().toISOString());
          setIsLive(true);
          setError(null);
        }
      } else {
        setIsLive(false);
      }

      // 2. Fetch wire ticker
      const tickerRes = await fetch('/api/ticker');
      if (tickerRes.ok) {
        const json = await tickerRes.json();
        if (json.success && Array.isArray(json.items) && json.items.length > 0) {
          setTickerItems(json.items);
        }
      }
    } catch (err: any) {
      console.warn('[Frontend Data] Express API unreachable, falling back to local archive:', err.message);
      setIsLive(false);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFeeds = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/refresh', { method: 'POST' });
      if (res.ok) {
        await fetchArticlesAndTicker();
      }
    } catch (err: any) {
      console.warn('[Frontend Data] Refresh failed:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchArticlesAndTicker]);

  useEffect(() => {
    fetchArticlesAndTicker();
  }, [fetchArticlesAndTicker]);

  return {
    articles,
    tickerItems,
    isLoading,
    isRefreshing,
    isLive,
    lastUpdated,
    error,
    refreshFeeds,
  };
}
