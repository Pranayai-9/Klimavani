import fs from 'fs';
import path from 'path';
import { Article } from '../../src/types/news';
import { MOCK_ARTICLES } from '../../src/data/mockArticles';

const STORAGE_DIR = path.resolve(process.cwd(), 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'articles.json');

export interface StoredData {
  lastUpdated: string;
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
      if (Array.isArray(data.articles) && data.articles.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('[Storage] Error reading articles cache:', err);
  }

  // Fallback to seed articles if empty or unreadable
  return {
    lastUpdated: new Date().toISOString(),
    sourceCount: 7,
    totalArticles: MOCK_ARTICLES.length,
    articles: MOCK_ARTICLES,
  };
}

/**
 * Atomically writes articles to data/articles.json
 */
export function saveArticles(articles: Article[], sourceCount: number = 7): StoredData {
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
    return getStoredArticles();
  }
}
