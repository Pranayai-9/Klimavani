import Parser from 'rss-parser';
import { VERIFIED_SOURCES, FeedSource } from './sources';
import { normalizeFeedItem } from './normalizer';
import { deduplicateArticles } from './validator';
import { getStoredArticles, saveArticles, StoredData } from './storage';
import { Article } from '../../src/types/news';

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Klimavani-Climate-Collector/1.0 (+https://github.com/klimavani/klimavani)',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
});

export interface CollectionResult {
  success: boolean;
  timestamp: string;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  totalCollected: number;
  newArticlesCount: number;
  errors: Array<{ sourceId: string; sourceName: string; error: string }>;
}

/**
 * Fetches a single feed with timeout and error capture
 */
async function fetchSourceFeed(source: FeedSource): Promise<{ source: FeedSource; items: Article[]; error?: string }> {
  try {
    const feed = await parser.parseURL(source.url);
    const normalized: Article[] = [];

    const rawItems = (feed.items || []).slice(0, 15);
    rawItems.forEach((item, index) => {
      try {
        const article = normalizeFeedItem(item, source, index);
        normalized.push(article);
      } catch (err: any) {
        // Skip individual unparseable item
      }
    });

    return { source, items: normalized };
  } catch (err: any) {
    return { source, items: [], error: err.message || 'Unknown network error' };
  }
}

/**
 * Runs the collector across all verified sources, deduplicates, and saves to storage
 */
export async function runCollector(): Promise<CollectionResult> {
  const startTime = Date.now();
  console.log(`[Collector] Starting feed collection at ${new Date().toISOString()} across ${VERIFIED_SOURCES.length} sources...`);

  const results = await Promise.allSettled(
    VERIFIED_SOURCES.map((source) => fetchSourceFeed(source))
  );

  const collectedArticles: Article[] = [];
  const errors: Array<{ sourceId: string; sourceName: string; error: string }> = [];
  let sourcesSucceeded = 0;

  for (const res of results) {
    if (res.status === 'fulfilled') {
      const { source, items, error } = res.value;
      if (error) {
        errors.push({ sourceId: source.id, sourceName: source.name, error });
        console.warn(`[Collector] Feed warning: ${source.name} - ${error}`);
      } else {
        sourcesSucceeded++;
        collectedArticles.push(...items);
        console.log(`[Collector] Fetched ${items.length} articles from ${source.name}`);
      }
    }
  }

  // Deduplicate newly collected articles
  const cleanNew = deduplicateArticles(collectedArticles);

  // Merge with existing stored articles so we don't lose older entries
  const existingData = getStoredArticles();
  const merged = deduplicateArticles([...cleanNew, ...existingData.articles]);

  const newCount = merged.length - existingData.articles.length;
  const storedResult = saveArticles(merged, sourcesSucceeded);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Collector] Finished in ${elapsed}s. Total stored: ${storedResult.totalArticles} articles (${newCount >= 0 ? '+' + newCount : newCount} new).`);

  return {
    success: true,
    timestamp: new Date().toISOString(),
    sourcesAttempted: VERIFIED_SOURCES.length,
    sourcesSucceeded,
    totalCollected: cleanNew.length,
    newArticlesCount: Math.max(0, newCount),
    errors,
  };
}
