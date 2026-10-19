# Klimavani

**Digital Climate Newspaper** — Aggregating verified climate science, extreme weather, policy, and environmental journalism from leading global sources.

> _"Klimavani"_ — from Sanskrit/Hindi roots combining "climate" (klima/jal-vayu) and "voice/vani" — the voice of the climate.

---

## Production URL

**Live application:** Will be available at `https://klimavani.vercel.app` after GitHub → Vercel deployment is completed (see [Deployment Steps](#deployment-steps-vercel) below).

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js 24+, Express 5, TypeScript |
| Data Storage | JSON file (`data/articles.json`) |
| News Collection | RSS Parser, HTTP fetch from 6 verified sources |
| Scheduler | In-process `setInterval` (Express server) |
| Icons | Lucide React |
| Analytics | Vercel Analytics |
| Deployment | Vercel (frontend + API) |

---

## Architecture Overview

```
┌──────────────────────────────┐
│  React Frontend (Vite/TSX)   │  → Built to dist/ → Served by Express
│  src/                        │    or Vercel CDN in production
└──────────────┬───────────────┘
               │ HTTP fetch /api/*
┌──────────────▼───────────────┐
│  Express API Server          │  → server/src/index.ts
│  Routes:                     │
│   GET  /api/articles         │
│   GET  /api/ticker           │
│   GET  /api/sources          │
│   GET  /api/health           │
│   POST /api/refresh          │
└──────────────┬───────────────┘
               │ read/write
┌──────────────▼───────────────┐
│  data/articles.json          │  → JSON flat-file storage
│  (atomic write via temp file)│
└──────────────────────────────┘
               ▲
               │ collects from
┌──────────────┴───────────────┐
│  RSS Collector               │  → server/src/collector.ts
│  Runs every 30 min (default) │
│  Sources: 6 verified feeds   │
└──────────────────────────────┘
```

---

## Repository Structure

```
Klimavani/
├── src/                          # React frontend
│   ├── components/
│   │   ├── common/               # ImageWithFallback, FilterControls, SearchInput, EmptyState
│   │   ├── layout/               # Header, Footer
│   │   ├── navigation/           # BreakingTicker
│   │   └── news/                 # ArticleModal, FeaturedStory, NewsCard, NewsGrid
│   ├── hooks/
│   │   ├── useNewsData.ts        # API fetch + polling logic
│   │   └── useNewsFilter.ts      # Client-side filtering/sorting
│   ├── pages/
│   │   └── HomePage.tsx
│   ├── types/
│   │   └── news.ts               # Article, ClimateCategory, SortOrder types
│   ├── utils/
│   │   └── date.ts               # formatArticleDate, formatTimeAgo
│   ├── data/
│   │   └── mockArticles.ts       # Static category list (CATEGORIES export)
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── server/src/                   # Express backend
│   ├── index.ts                  # Server entry point, routes, scheduler
│   ├── collector.ts              # RSS collection orchestrator
│   ├── normalizer.ts             # RSS item → Article normalization
│   ├── sources.ts                # Verified RSS feed list
│   ├── storage.ts                # articles.json read/write
│   ├── validator.ts              # Deduplication
│   ├── config/
│   │   ├── env.ts                # Environment variable validation
│   │   └── sources.ts            # Additional source config (if present)
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── sanitizer.ts
├── data/
│   └── articles.json             # Article archive (runtime, in .gitignore)
├── docs/
│   ├── PRODUCTION_DEPLOYMENT_PLAN.md
│   ├── OPERATIONS_AND_RECOVERY.md
│   └── PRODUCTION_TEST_REPORT.md
├── public/                       # Static public assets
├── dist/                         # Built frontend (generated, in .gitignore)
├── .env.example                  # Environment variable template
├── vercel.json                   # Vercel deployment configuration
├── vite.config.ts                # Vite config with /api proxy for local dev
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Local Development

### Prerequisites
- Node.js 24+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/Pranayai-9/Klimavani.git
cd Klimavani

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# (The defaults in .env.example work for local development — no changes needed)
```

### Running Locally

You need **two terminals** for local development:

**Terminal 1 — Express backend (port 5000):**
```bash
npm run server
```

**Terminal 2 — Vite dev server (port 3000):**
```bash
npm run dev
```

Open `http://localhost:3000`. Vite automatically proxies `/api/*` requests to the Express server on port 5000.

The collector runs automatically 3 seconds after server start, then every 30 minutes.

---

## Production Build

```bash
# Type-check and build the frontend
npm run build

# Verify TypeScript (frontend + backend)
npm run typecheck

# Preview the production build locally
npm run preview
```

The production build outputs to `dist/`. In production, Express serves `dist/` as static files and handles all `/api/*` routes.

---

## Deployment Steps (Vercel)

> **Prerequisites:** GitHub repository connected to Vercel account. Push the codebase to GitHub first.

### 1. Push to GitHub

```bash
git add .
git commit -m "Production hardening: fix useNewsData, unicode corruption, tsconfig, deployment config"
git push origin master
```

### 2. Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import from GitHub → select `Pranayai-9/Klimavani` (or your repo)
3. **Framework Preset:** Other
4. **Root Directory:** `.` (leave as project root)
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. **Install Command:** `npm install`

### 3. Set Environment Variables in Vercel

In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Name | Value | Environment |
|---|---|---|
| `NODE_ENV` | `production` | Production |
| `VITE_API_URL` | `/api` | Production + Preview |
| `COLLECTION_INTERVAL_MINUTES` | `30` | Production |

> **Note:** `VITE_API_URL=/api` uses relative routing. Since the Express API and React frontend are served from the same Vercel origin, all `/api/*` calls work without cross-origin issues.

### 4. Deploy

Click **Deploy**. Vercel will:
1. Run `npm install`
2. Run `npm run build` (sets `VITE_API_URL=/api` from env vars)
3. Deploy `dist/` as CDN-cached static files
4. Route `/api/*` to the Express server function

### 5. Verify Deployment

```bash
# Check health endpoint
curl https://klimavani.vercel.app/api/health

# Check articles
curl https://klimavani.vercel.app/api/articles | head -c 500

# Trigger a collection run
curl -X POST https://klimavani.vercel.app/api/refresh
```

---

## Alternative Deployment: Render (Recommended for Live Collection)

For persistent scheduled collection without laptop dependency:

1. Create a [Render](https://render.com) Web Service
2. Connect your GitHub repo
3. Set **Build Command:** `npm install && npm run build`
4. Set **Start Command:** `tsx server/src/index.ts`
5. Set **Environment:** `NODE_ENV=production`, `VITE_API_URL=/api`
6. Enable **Persistent Disk** (mount at `/data`, set `DATA_DIR=/data`)

The Express server will:
- Serve `dist/` as static files
- Run the RSS collector every 30 minutes automatically
- Persist articles to `/data/articles.json`

---

## Required Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `PORT` | `5000` | No | Express server port |
| `NODE_ENV` | `development` | No | `development` or `production` |
| `DATA_DIR` | `./data` | No | Directory for articles.json |
| `COLLECTION_INTERVAL_MINUTES` | `30` | No | RSS collection frequency |
| `MAX_ARTICLES_PER_FEED` | `20` | No | Articles fetched per source |
| `REQUEST_TIMEOUT_MS` | `9000` | No | HTTP timeout for RSS fetch |
| `VITE_API_URL` | (none) | **YES for build** | API base URL embedded in frontend |

---

## News Sources

Klimavani collects from these verified RSS feeds:

| Source | Category | URL |
|---|---|---|
| NOAA News | Climate Science | https://www.noaa.gov/rss.xml |
| Phys.org Earth & Environment | Research | https://phys.org/rss-feed/earth-news/ |
| UN Climate Change News | Climate Policy | https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml |
| ScienceDaily Earth & Climate | Research | https://www.sciencedaily.com/rss/earth_climate.xml |
| Carbon Brief | Renewable Energy | https://www.carbonbrief.org/feed/ |
| Mongabay Environmental News | Sustainability | https://news.mongabay.com/feed/ |

All articles link to their original publishers. No AI-generated summaries.

---

## Troubleshooting

**Frontend shows no articles:**
- Check `/api/health` — if `totalStoredArticles` is 0, run a manual collection: `POST /api/refresh`
- On Vercel: articles.json seed data may not have been committed. Check `.gitignore`.

**Images not loading:**
- External images from RSS feeds may be unavailable. The `ImageWithFallback` component shows a category placeholder automatically.
- Check browser DevTools Network tab for 403/404 image responses.

**API calls failing in production:**
- Verify `VITE_API_URL=/api` is set in Vercel environment variables
- Check Vercel function logs for Express errors

**TypeScript errors:**
```bash
npm run typecheck
```

**Build fails:**
- Ensure `VITE_API_URL` is set before building
- Check Node.js version: `node --version` (must be ≥ 24)

**Collector not running:**
- On Vercel serverless: In-process `setInterval` does not run between requests. Use `/api/refresh` manually or upgrade to Vercel Pro (Cron Jobs).
- On Render: The service may be sleeping (free tier). Upgrade to Starter ($7/mo) for always-on operation.

---

## Documentation

- [`docs/PRODUCTION_DEPLOYMENT_PLAN.md`](docs/PRODUCTION_DEPLOYMENT_PLAN.md) — Architecture decisions, cost analysis, hosting options
- [`docs/OPERATIONS_AND_RECOVERY.md`](docs/OPERATIONS_AND_RECOVERY.md) — Health checks, log inspection, rollback, backup procedures
- [`docs/PRODUCTION_TEST_REPORT.md`](docs/PRODUCTION_TEST_REPORT.md) — Test results, issues found and resolved
- [`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md) — Earlier readiness assessment
