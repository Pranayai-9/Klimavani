# Klimavani — Production Deployment Plan

## Selected Architecture

**Approach:** Full-stack monorepo deployed to Vercel (frontend static + API routes via Node.js serverless functions) with the persistent scheduled collector handled via a Vercel Cron Job.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          VERCEL                                  │
│                                                                  │
│   ┌──────────────────┐        ┌───────────────────────────────┐ │
│   │  Static Frontend  │        │  Express API (Node.js)        │ │
│   │  (dist/ folder)   │◄──────►│  /api/* routes                │ │
│   │  React + Vite     │        │  server/src/index.ts          │ │
│   └──────────────────┘        └───────────────────────────────┘ │
│                                             │                    │
│                                             │ reads/writes       │
│                                    ┌────────▼──────────┐        │
│                                    │  data/articles.json│        │
│                                    │  (Vercel /tmp or   │        │
│                                    │  ephemeral FS)     │        │
│                                    └────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

> **IMPORTANT LIMITATION:** Vercel's serverless functions run in a stateless, ephemeral environment. The `data/articles.json` file written during one invocation may NOT persist to the next invocation. The scheduled in-process collector (`setInterval`) does NOT run between HTTP requests on Vercel.

---

## Deployment Strategy

### Option A (Primary) — Vercel Frontend + Static Data Seeding

Because Vercel serverless functions are ephemeral:

1. The `data/articles.json` file is committed to the repository as seed data.
2. The Vercel deployment serves this pre-collected data as the article archive.
3. On-demand refresh via `/api/refresh` writes to the function's ephemeral `/tmp` directory (data is lost on cold start).
4. **Scheduled collection is NOT reliably supported on Vercel's free tier.**

**Suitable for:** Static snapshot deployments, demo/preview purposes.

### Option B (Recommended for Live Operation) — Render Web Service

For a continuously operating live newspaper with persistent data and reliable scheduling:

| Component | Provider | Plan |
|---|---|---|
| Frontend + API | [Render](https://render.com) Web Service | Free (with sleep) or \$7/mo Starter |
| Data Storage | Local filesystem (`data/articles.json`) | Persistent disk on Render |
| Scheduler | In-process `setInterval` in Express | Runs as long as service is active |

Render provides:
- A persistent filesystem (articles survive restarts)
- A continuously running Node.js process (scheduler works)
- Free tier (spins down after 15 min inactivity — scheduler stops when sleeping)
- Paid tier ($7/mo) keeps service always-on

### Option C (Best for Production) — Render Web Service + Persistent Disk

| Component | Provider | Plan |
|---|---|---|
| Backend + Scheduler | Render Web Service | \$7/mo (always-on) |
| Frontend | Vercel (static) | Free |
| Persistent Disk | Render Disk | \$0.25/GB/mo |
| Data | `articles.json` on persistent disk | Survives restarts |

---

## Current Implementation Decision: Vercel (with seed data)

For initial public launch, we deploy to Vercel with:

1. **Pre-built frontend** served from `dist/`
2. **Express API** via Vercel Node.js functions
3. **Seed data** committed in `data/articles.json`
4. **Manual refresh** available via `/api/refresh` (ephemeral, resets on cold start)

This gets Klimavani publicly accessible immediately. For persistent live collection, migrate to Render using the guide in `OPERATIONS_AND_RECOVERY.md`.

---

## Vercel Configuration

**Repository:** Connect to GitHub repository at `github.com/Pranayai-9/Klimavani` (or equivalent)

**Build Settings:**
| Setting | Value |
|---|---|
| Framework Preset | Other |
| Root Directory | `.` (project root) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**Environment Variables (set in Vercel Dashboard → Settings → Environment Variables):**

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Required |
| `VITE_API_URL` | `/api` | Used by Vite build — embedded in JS |
| `COLLECTION_INTERVAL_MINUTES` | `30` | Optional; ignored on serverless |
| `DATA_DIR` | `/tmp` | Serverless ephemeral storage |

**vercel.json routing:**
- `/api/*` → Express handler (`server/src/index.ts`)
- `/*` → `dist/index.html` (SPA fallback)
- Static assets → `dist/` with appropriate cache headers

---

## Data Flow

```
Browser Request
     │
     ▼
Vercel CDN (static assets cached globally)
     │
     ▼
React App (dist/index.html)
     │
     │ fetch /api/articles
     ▼
Express API (Vercel Node.js function)
     │
     │ reads articles.json
     ▼
data/articles.json (seed data from repo, or /tmp on serverless)
```

---

## Cost Analysis

### Vercel (Frontend + API)
- **Free tier:** 100 GB bandwidth/mo, 100 serverless function hours/mo, unlimited static
- **What's free:** All frontend serving, API calls within limits
- **What may incur charges:** Excessive function invocations (>1M/mo on Pro)
- **Payment required:** No (Hobby plan is free)
- **Scheduled jobs:** NOT supported on free Vercel (use Vercel Cron on Pro, or external cron)

### Render (Alternative for live operation)
- **Free tier:** Web service sleeps after 15 min inactivity
- **\$7/mo Starter:** Always-on, no sleep
- **Persistent Disk:** \$0.25/GB/mo
- **Scheduler:** Works via in-process `setInterval` when service is running

---

## Free-Tier Constraints

| Provider | Constraint | Impact |
|---|---|---|
| Vercel | Serverless = no persistent state | articles.json seed data only |
| Vercel | No persistent `setInterval` | Collector doesn't run automatically |
| Vercel | `/tmp` wiped on cold start | Refreshed articles lost |
| Render Free | Sleeps after 15 min | Scheduler pauses when sleeping |

---

## Known Limitations

1. **Vercel deployment:** Articles are from committed seed data unless manually refreshed
2. **Automatic collection on Vercel:** Requires Vercel Cron (Pro plan) or external scheduler
3. **Data persistence on Vercel:** Each cold start begins with seed data from `data/articles.json`
4. **Render free tier:** Service sleeps → scheduled collection pauses when no visitors

---

## Deployment Dependencies

- Node.js ≥ 24 (as specified in `package.json` `engines`)
- `npm install` must succeed in CI/CD environment
- `VITE_API_URL` must be set before `npm run build`
- `data/articles.json` must exist or be writable

---

## Alternative Architecture (If Vercel Fails)

Deploy as a single Express server on Render that:
1. Runs `npm run build` during Render build step
2. Serves `dist/` as static files via `express.static`
3. Exposes all `/api/*` routes
4. Runs scheduled collection via `setInterval`
5. Persists `articles.json` to Render's persistent disk

Start command: `tsx server/src/index.ts`

This is the fully self-contained approach and is the most reliable for live news operation.
