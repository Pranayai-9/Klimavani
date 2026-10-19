import { useState, useEffect, useCallback, useRef } from 'react';
import { Article } from '../types/news';
import type { TickerItem } from '../components/navigation/BreakingTicker';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // Re-fetch articles every 5 minutes

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
  const [articles, setArticles] = useState<Article[]>([]);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchArticlesAndTicker = useCallback(async () => {
    try {
      // 1. Fetch articles from Express REST API
      const articlesRes = await fetch('/api/articles');
      if (articlesRes.ok) {
        const json = await articlesRes.json();
        if (json.success && Array.isArray(json.data)) {
          setArticles(json.data);
          setLastUpdated(json.lastUpdated || null);
          setIsLive(true);
          setIsRefreshing(Boolean(json.collection?.isCollecting));
          const failedSources = json.collection?.lastResult?.errors || [];
          setError(failedSources.length
            ? `${failedSources.length} source${failedSources.length === 1 ? '' : 's'} failed: ${failedSources.map((item: { sourceName: string }) => item.sourceName).join(', ')}`
            : null);
        }
      } else {
        setIsLive(false);
        setError(`Article service returned ${articlesRes.status}`);
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
      console.warn('[Frontend Data] Express API unreachable, using local archive:', err.message);
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
        // Wait a moment for server-side collection to complete, then re-fetch display data
        await new Promise((r) => setTimeout(r, 1500));
        await fetchArticlesAndTicker();
      } else {
        const result = await res.json().catch(() => ({}));
        setError(result.error || result.message || `Refresh failed (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[Frontend Data] Refresh failed:', err.message);
      setError(err.message || 'Unable to refresh feeds');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchArticlesAndTicker]);

  // Initial fetch on mount
  useEffect(() => {
    fetchArticlesAndTicker();
  }, [fetchArticlesAndTicker]);

  // Periodic re-fetch — keeps displayed articles current without page reload
  useEffect(() => {
    pollTimerRef.current = setInterval(() => {
      fetchArticlesAndTicker();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
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
