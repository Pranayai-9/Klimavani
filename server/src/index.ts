import express from 'express';
import cors from 'cors';
import { getStoredArticles } from './storage';
import { runCollector } from './collector';
import { VERIFIED_SOURCES } from './sources';
import { ClimateCategory, SortOrder } from '../../src/types/news';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Klimavani Editorial Data API',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
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
    const { category, search, sort = 'newest', limit } = req.query;
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
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      }
      if (sort === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default 'newest'
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    const totalBeforeLimit = articles.length;
    if (limit && !isNaN(Number(limit))) {
      articles = articles.slice(0, Number(limit));
    }

    res.json({
      success: true,
      data: articles,
      total: totalBeforeLimit,
      returned: articles.length,
      lastUpdated: stored.lastUpdated,
      sourceCount: stored.sourceCount,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Trigger Collector Refresh
let isRefreshing = false;
app.post('/api/refresh', async (_req, res) => {
  if (isRefreshing) {
    return res.status(429).json({
      success: false,
      message: 'A feed collection job is already actively running. Please wait.',
    });
  }

  isRefreshing = true;
  try {
    const result = await runCollector();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    isRefreshing = false;
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`[Express API] Klimavani REST API running on http://127.0.0.1:${PORT}`);
  console.log(`[Express API] Endpoints available: /api/articles, /api/ticker, /api/sources, /api/refresh, /api/health`);

  // Run initial collection in background after 3 seconds
  setTimeout(() => {
    runCollector().catch((err) => console.error('[Collector] Boot collection error:', err));
  }, 3000);

  // Recurring refresh every 30 minutes
  setInterval(() => {
    runCollector().catch((err) => console.error('[Collector] Periodic collection error:', err));
  }, 30 * 60 * 1000);
});
