import express from 'express';
import cors from 'cors';
import path from 'path';
import { getStoredArticles } from './storage';
import { getCollectionStatus, runCollector } from './collector';
import { VERIFIED_SOURCES } from './sources';
import { ENV } from './config/env';

const app = express();
const PORT = ENV.PORT;
const IS_PRODUCTION = ENV.NODE_ENV === 'production';
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');

// Collector state — declared here so all endpoints can reference them
let lastManualRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 5 * 60_000;

app.disable('x-powered-by');
// The production deployment serves the UI and API from one origin. CORS is
// only enabled for the local Vite development server.
if (!IS_PRODUCTION) {
  app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
}
app.use(express.json({ limit: '1mb' })); // Limit request body size

// 1. Health check
app.get('/api/health', (_req, res) => {
  const stored = getStoredArticles();
  res.json({
    status: 'ok',
    service: 'Klimavani Editorial Data API',
    version: '3.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    collection: {
      ...getCollectionStatus(),
      totalStoredArticles: stored.totalArticles,
      lastDataUpdated: stored.lastUpdated,
    },
  });
});

// 2. Verified Sources List
app.get('/api/sources', (_req, res) => {
  res.json({
    sources: VERIFIED_SOURCES,
    total: VERIFIED_SOURCES.length,
  });
});

// 3. Articles Endpoint with search, category filtering, and sorting
app.get('/api/articles', (req, res) => {
  try {
    const { category, search, sort = 'newest', limit, offset = '0' } = req.query;

    if ((category !== undefined && typeof category !== 'string') ||
        (search !== undefined && typeof search !== 'string') ||
        (typeof sort !== 'string' || !['newest', 'oldest', 'title'].includes(sort))) {
      return res.status(400).json({ success: false, error: 'Invalid category, search, or sort parameter' });
    }

    // Input validation
    if (limit && (typeof limit !== 'string' || !/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 200)) {
      return res.status(400).json({ success: false, error: 'Invalid limit parameter (1-200)' });
    }
    if (typeof offset !== 'string' || !/^\d+$/.test(offset) || Number(offset) > 100000) {
      return res.status(400).json({ success: false, error: 'Invalid offset parameter (0-100000)' });
    }
    if (search && typeof search === 'string' && search.length > 200) {
      return res.status(400).json({ success: false, error: 'Search query too long (max 200 chars)' });
    }
    const stored = getStoredArticles();
    let articles = [...stored.articles];

    // Category filter
    if (category && typeof category === 'string' && category !== 'All News') {
      articles = articles.filter(
        (a) => a.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Search query
    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      if (q) {
        articles = articles.filter((a) => {
          return (
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            (a.editorialTeaser && a.editorialTeaser.toLowerCase().includes(q)) ||
            a.sourceName.toLowerCase().includes(q) ||
            (a.geographicScope && a.geographicScope.toLowerCase().includes(q))
          );
        });
      }
    }

    // Sorting
    articles.sort((a, b) => {
      if (sort === 'oldest') {
        return comparePublicationDates(a.publishedAt, b.publishedAt, 1);
      }
      if (sort === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default 'newest'
      return comparePublicationDates(a.publishedAt, b.publishedAt, -1);
    });

    const totalBeforeLimit = articles.length;
    articles = articles.slice(Number(offset));
    if (limit && !isNaN(Number(limit))) {
      articles = articles.slice(0, Number(limit));
    }

    res.json({
      success: true,
      data: articles,
      total: totalBeforeLimit,
      returned: articles.length,
      offset: Number(offset),
      lastUpdated: stored.lastUpdated,
      sourceCount: stored.sourceCount,
      collection: getCollectionStatus(),
    });
  } catch (err: any) {
    console.error('[API] Articles endpoint error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve articles' });
  }
});

function comparePublicationDates(a: string, b: string, direction: 1 | -1): number {
  const aTime = Date.parse(a);
  const bTime = Date.parse(b);
  if (!Number.isFinite(aTime)) return Number.isFinite(bTime) ? 1 : 0;
  if (!Number.isFinite(bTime)) return -1;
  return (aTime - bTime) * direction;
}

// 4. Wire Ticker Items
app.get('/api/ticker', (_req, res) => {
  try {
    const stored = getStoredArticles();
    // Prefer breaking articles or top 6 newest
    const breaking = stored.articles.filter((a) => a.isBreaking);
    const pool = breaking.length >= 3 ? breaking : stored.articles;
    const items = pool.slice(0, 6).map((a) => ({
      id: a.id,
      category: a.category.toUpperCase(),
      text: a.title,
      articleUrl: a.articleUrl,
      sourceName: a.sourceName,
    }));

    res.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (err: any) {
    console.error('[API] Ticker endpoint error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve ticker items' });
  }
});

// 5. Trigger Collector Refresh with rate limiting
app.post('/api/refresh', async (_req, res) => {
  const now = Date.now();

  if (getCollectionStatus().isCollecting) {
    return res.status(429).json({
      success: false,
      message: 'A feed collection job is already actively running. Please wait.',
    });
  }

  if (now - lastManualRefreshTime < REFRESH_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((REFRESH_COOLDOWN_MS - (now - lastManualRefreshTime)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${waitSeconds} seconds before refreshing again.`,
    });
  }

  lastManualRefreshTime = now;
  try {
    const result = await runCollector();
    res.status(result.success ? 200 : 502).json(result);
  } catch (err: any) {
    console.error('[API] Refresh error:', err);
    res.status(500).json({ success: false, error: 'Collection failed. Please try again later.' });
  } finally { /* collector owns shared lock for scheduled and manual runs */ }
});

if (IS_PRODUCTION) {
  app.use(express.static(DIST_DIR, {
    setHeaders: (res, filePath) => {
      const normalized = filePath.split(path.sep).join('/');
      if (normalized.endsWith('/index.html')) res.setHeader('Cache-Control', 'no-cache');
      else if (normalized.includes('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }));
  app.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method) || req.path.startsWith('/api/')) return next();
    res.sendFile(INDEX_FILE, (err) => { if (err) next(err); });
  });
}

app.use((_req, res) => res.status(404).json({ success: false, error: 'Not found' }));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API] Unhandled request error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start one collector scheduler per process and stop it cleanly on deploy/restart.
let startupCollectionTimer: ReturnType<typeof setTimeout>;
let collectionInterval: ReturnType<typeof setInterval>;
const httpServer = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Express API] Klimavani web service listening on port ${PORT}`);
  console.log(`[Express API] Endpoints available: /api/articles, /api/ticker, /api/sources, /api/refresh, /api/health`);

  startupCollectionTimer = setTimeout(() => {
    runCollector().catch((err) => console.error('[Collector] Boot collection error:', err));
  }, 3000);

  const intervalMs = ENV.COLLECTION_INTERVAL_MINUTES * 60 * 1000;
  console.log(`[Express API] Scheduled collection every ${ENV.COLLECTION_INTERVAL_MINUTES} minutes`);
  collectionInterval = setInterval(() => {
    runCollector().catch((err) => console.error('[Collector] Periodic collection error:', err));
  }, intervalMs);
});

function shutdown(signal: string) {
  console.log(`[Process] ${signal} received; shutting down`);
  clearTimeout(startupCollectionTimer);
  clearInterval(collectionInterval);
  httpServer.close((error) => {
    if (error) {
      console.error('[Process] Shutdown failed:', error);
      process.exitCode = 1;
    }
  });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
