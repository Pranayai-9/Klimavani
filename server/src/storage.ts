import fs from 'fs';
import path from 'path';
import { Article } from '../../src/types/news';
import { ENV } from './config/env';

const STORAGE_DIR = ENV.DATA_DIR;
const STORAGE_FILE = path.join(STORAGE_DIR, 'articles.json');

export interface StoredData {
  lastUpdated: string | null;
  sourceCount: number;
  totalArticles: number;
  articles: Article[];
}

/**
 * Initializes storage directory and returns current cached articles
 */
export function getStoredArticles(): StoredData {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const data: StoredData = JSON.parse(raw);
      if (Array.isArray(data.articles)) {
        return data;
      }
      throw new Error('Article archive has an invalid format');
    }
  } catch (err) {
    console.error('[Storage] Error reading articles cache:', err);
    throw new Error(`Unable to read article archive: ${err instanceof Error ? err.message : String(err)}`);
  }

  // New installations start empty; mock content must not masquerade as live news.
  return {
    lastUpdated: null,
    sourceCount: 0,
    totalArticles: 0,
    articles: [],
  };
}

/**
 * Atomically writes articles to data/articles.json. No automatic retention
 * is applied so useful archive records are not silently discarded.
 */
export function saveArticles(articles: Article[], sourceCount: number = 0): StoredData {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    // Sort newest first
    const sorted = [...articles].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Ensure at least one featured article
    if (sorted.length > 0 && !sorted.some((a) => a.isFeatured)) {
      sorted[0].isFeatured = true;
    }

    const data: StoredData = {
      lastUpdated: new Date().toISOString(),
      sourceCount,
      totalArticles: sorted.length,
      articles: sorted,
    };

    const tempFile = `${STORAGE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, STORAGE_FILE);

    return data;
  } catch (err) {
    console.error('[Storage] Error saving articles:', err);
    throw new Error(`Unable to persist article archive: ${err instanceof Error ? err.message : String(err)}`);
  }
}
