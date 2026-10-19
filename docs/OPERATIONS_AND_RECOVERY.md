# Klimavani — Operations & Recovery Guide

## Health Checks

### Check Service Health

**Production (Vercel):**
```
GET https://klimavani.vercel.app/api/health
```

**Local development:**
```
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Klimavani Editorial Data API",
  "version": "3.0.0",
  "uptime": 123.45,
  "timestamp": "2026-10-19T13:00:00.000Z",
  "collection": {
    "isCollecting": false,
    "lastAttemptAt": "2026-10-19T12:30:00.000Z",
    "lastSuccessfulAt": "2026-10-19T12:30:05.000Z",
    "totalStoredArticles": 85,
    "lastDataUpdated": "2026-10-19T12:30:05.000Z"
  }
}
```

If `status` is not `"ok"` or `totalStoredArticles` is 0, the service has a problem.

---

## Inspecting Logs

### Vercel Logs
1. Go to [vercel.com](https://vercel.com) → Your project → **Deployments**
2. Click the latest deployment → **Functions** tab
3. Filter by `/api/` to see Express handler logs
4. Look for lines starting with `[Collector]`, `[Storage]`, `[API]`, `[Express API]`

### Render Logs
1. Go to [render.com](https://render.com) → Your service → **Logs**
2. Filter by `[Collector]` for collection status
3. Filter by `[API]` for request errors

### Local Development Logs
The Express server logs directly to the terminal. Key log prefixes:
- `[Express API]` — server startup and scheduling
- `[Collector]` — feed collection events
- `[Storage]` — file read/write operations
- `[API]` — request handling errors

---

## Restarting / Redeploying

### Vercel
**Trigger a redeploy:**
- Push a new commit to the connected GitHub branch (auto-deploy triggers)
- Or: Vercel Dashboard → Deployments → Three-dot menu on latest → **Redeploy**

**Rollback:**
- Vercel Dashboard → Deployments → Find a previous working deployment → **Promote to Production**
- This does NOT affect the database/articles.json — it only rolls back code

### Render
```bash
# Trigger manual redeploy via Render dashboard
# Or push to the connected Git branch
```
The service will rebuild using `npm install && npm run build` and restart with `tsx server/src/index.ts`.

---

## Triggering a Manual Collection Run

### Via API (safe, rate-limited to once per 5 minutes):
```bash
curl -X POST https://klimavani.vercel.app/api/refresh
```

Or from the browser: click the **refresh icon** in the Filter Controls bar of the Klimavani UI.

### Via direct server access (Render):
SSH/shell access is not available on free Render plans. Redeploy to trigger a boot-time collection (runs 3 seconds after server start).

---

## Identifying a Failing Source

Check the health endpoint collection result:
```bash
curl https://klimavani.vercel.app/api/health | jq '.collection.lastResult.errors'
```

Each failed source appears as:
```json
[
  {
    "sourceId": "carbon-brief",
    "sourceName": "Carbon Brief",
    "error": "Request timed out after 9000ms"
  }
]
```

The system continues collecting from other sources when one fails — existing articles are preserved.

Current verified sources:
| ID | Name | URL |
|---|---|---|
| `noaa-news` | NOAA News | https://www.noaa.gov/rss.xml |
| `phys-earth` | Phys.org Earth & Environment | https://phys.org/rss-feed/earth-news/ |
| `un-climate` | UN Climate Change News | https://news.un.org/feed/... |
| `sciencedaily-climate` | ScienceDaily Earth & Climate | https://www.sciencedaily.com/rss/earth_climate.xml |
| `carbon-brief` | Carbon Brief | https://www.carbonbrief.org/feed/ |
| `mongabay` | Mongabay Environmental News | https://news.mongabay.com/feed/ |

---

## Verifying Database Persistence

### On Vercel (ephemeral — data resets on cold start):
Articles from `data/articles.json` in the repository are the baseline. Manually refreshed articles are stored in `/tmp` and lost when the function instance recycles.

### On Render (persistent disk):
1. Note the article count: `curl https://YOUR_RENDER_URL/api/health | jq '.collection.totalStoredArticles'`
2. Redeploy the service
3. Check article count again — it should be identical (articles survived restart)

---

## Restoring a Backup

### For `data/articles.json` (file-based storage):

**Manual backup:**
```bash
cp data/articles.json data/articles.json.backup.$(date +%Y%m%d)
```

**Restoring:**
```bash
cp data/articles.json.backup.20261019 data/articles.json
```

**From Git (if articles.json is tracked):**
```bash
# Restore to the last committed version
git checkout HEAD -- data/articles.json
```

> **Note:** `data/articles.json` is listed in `.gitignore` by default. To back it up via Git, temporarily remove the gitignore entry and commit the file.

---

## Rotating Compromised Credentials

If any credentials (API keys, tokens, database passwords) are exposed:

1. **Immediately revoke** the credential at the provider (GitHub, Vercel, Render dashboard)
2. **Generate a new** credential
3. **Update** the environment variable in Vercel/Render Dashboard (NOT in code files)
4. **Redeploy** to pick up the new value
5. **Audit Git history** — if the secret was ever committed, assume it is compromised permanently regardless of removal:
   ```bash
   git log -p --all -S "YOUR_SECRET_VALUE"
   ```
6. If found in history, use [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) to scrub and force-push — then rotate the credential again.

**Current secrets in use:** None. Klimavani uses only public RSS feeds and requires no API keys.

---

## Rolling Back a Deployment

### Vercel Code Rollback:
1. Vercel Dashboard → Project → Deployments tab
2. Find the last known-good deployment (green status)
3. Click three-dot menu → **Promote to Production**
4. The previous build is immediately live — no rebuild required

### Render Code Rollback:
1. In your Git repository: `git log --oneline` to find the last good commit
2. `git revert HEAD` (or target specific commit) to create a rollback commit
3. Push to the connected branch — Render auto-deploys

> **Do NOT force-push** (`git push --force`) to a branch connected to production deployment.

---

## Recovering from a Failed Database Migration

Klimavani uses JSON file storage (no SQL migrations). The recovery procedure is:

1. Locate the most recent backup: `data/articles.json.backup.*`
2. Copy it back: `cp data/articles.json.backup.YYYYMMDD data/articles.json`
3. Restart the service — the backup data is immediately available

If no backup exists, the service will start with an empty archive and populate on next collection run (approximately 30 minutes for 6 sources).

---

## Updating the Application

### Code Updates:
1. Make changes to the codebase locally
2. Run `npm run build` to verify the build succeeds
3. Run `npm run typecheck` to verify TypeScript passes
4. Commit and push to the connected GitHub branch
5. Vercel/Render will auto-deploy within 1–2 minutes

### Adding a New RSS Source:
1. Edit `server/src/config/sources.ts` (if it exists) or `server/src/sources.ts`
2. Add a new entry to the `VERIFIED_SOURCES` array
3. Test locally: `npm run server` then `curl -X POST http://localhost:5000/api/refresh`
4. Commit and push to deploy

### Changing Collection Interval:
Update `COLLECTION_INTERVAL_MINUTES` environment variable in Vercel/Render dashboard.
No code change required — the value is read at startup.

---

## Backup Strategy

| Platform | Backup Method | Frequency | Retention | Notes |
|---|---|---|---|---|
| Vercel | Not applicable (ephemeral `/tmp`) | N/A | N/A | Seed data in repo |
| Render Free | Manual copy of `articles.json` | Manual | Manual | No auto-backup |
| Render Paid | Render Disk snapshots | Daily | 7 days | Check Render docs |
| Git (any) | Commit `articles.json` to repo | On demand | Git history | Remove gitignore entry |

**Recommended:** For local dev, back up `data/articles.json` to a separate folder before major changes.
