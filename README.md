# Klimavani

Klimavani is a digital climate newspaper that collects RSS news and presents source-attributed headlines, descriptions, publication dates, images, and article links. It uses deterministic feed parsing and category rules; it does not use AI summaries or recommendations.

## Features

- RSS collection, normalization, URL/title deduplication, and a persistent local JSON archive.
- Express API with category/search/sort filters, bounded pagination, source list, health status, and rate-limited manual collection.
- React newspaper interface with featured story, searchable category filters, external source links, lazy images, and image fallbacks.
- Background collection every configured interval and browser data polling every five minutes.

## Stack and structure

- React 18, TypeScript, Vite 6, Tailwind CSS 3.
- Node.js 24 LTS, Express 5, `rss-parser`, and JSON file storage (`data/articles.json`). SQLite is not implemented.
- `src/`: frontend, UI components, filtering and display hooks.
- `server/src/`: API, RSS collector, normalization, validation, source registry, and storage.
- `data/articles.json`: generated persistent archive; ignored by Git.

## Requirements and installation

Use Node.js 18 or newer and npm. From the project root:

```sh
npm install
```

Copy `.env.example` to `.env` if you need to change the defaults. `.env` is ignored by Git. The example file contains no credentials.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Express API port |
| `NODE_ENV` | `development` | Set to `production` to serve the built UI and disable development CORS |
| `COLLECTION_INTERVAL_MINUTES` | `15` | Background RSS collection interval |
| `DATA_DIR` | `./data` | Directory for the persistent `articles.json` archive; set to an absolute mounted disk path in production |
| `MAX_ARTICLES_PER_FEED` | `20` | Maximum feed items considered per source per collection |
| `REQUEST_TIMEOUT_MS` | `9000` | Timeout for one RSS source request |

## Run locally

Open two terminals in the project root:

```sh
npm run server
```

```sh
npm run dev
```

Open `http://localhost:3000`. Vite proxies `/api` to `http://127.0.0.1:5000`. The API runs an initial collection shortly after startup and repeats according to `COLLECTION_INTERVAL_MINUTES`. The browser refreshes API data every five minutes; its refresh button triggers a real collection and is protected by a five-minute global cooldown.

## Sources and collection

The active source registry is `server/src/sources.ts`. The live check on 19 October 2026 succeeded for NOAA, Phys.org, UN News climate coverage, ScienceDaily, Carbon Brief, and Mongabay. NASA Earth Observatory was removed from active collection after its configured feed returned malformed XML (`No whitespace between attributes`). Recheck before re-enabling. `server/src/config/sources.ts` is a separate, currently unused registry and should not be treated as active.

Each source fetch has a nine-second parser timeout and feeds are fetched concurrently with failures isolated per source. Article validation rejects missing titles, invalid publication dates, and non-HTTP(S) article URLs. Collection failures are returned with source identifiers and logged. Collection runs share a lock to prevent scheduled and manual jobs from overlapping. Deduplication removes tracking parameters and compares canonical URLs and titles.

## Database and archive behavior

The application currently persists to `data/articles.json` using an atomic temporary-file rename. It loads the existing archive after restart. No automatic expiry or size cap is applied, so the archive will grow over time. Keep this directory on persistent disk. The fallback UI is empty until the API responds; it does not present mock records as live news.

## API

- `GET /api/health` — process, stored article, and collection status.
- `GET /api/articles?category=Research&search=ocean&sort=newest&limit=20&offset=0` — article results; `sort` supports `newest`, `oldest`, and `title`; limit is 1–200.
- `GET /api/ticker` — current ticker items.
- `GET /api/sources` — active source configuration.
- `POST /api/refresh` — starts a collection, subject to in-progress and cooldown checks.

## Checks

```sh
npm run typecheck
npm run build
npx tsx server/src/test-sources.ts
```

`test-sources.ts` contacts each configured RSS source sequentially. It requires outbound network access and can take time due to per-source timeouts and delays. There is no automated unit or end-to-end test suite configured yet.

## Production build and deployment

Build the frontend with `npm run build`. With `NODE_ENV=production`, `npm start` serves the generated `dist/` directory and `/api/*` from the same Express process. This runtime is designed for Node.js 24 LTS or newer and requires an always-on process manager/platform.

### Recommended deployment shape

Use one always-on Node.js 24 LTS web service for the frontend, API, and scheduled collector. This keeps the current JSON archive and in-process collection lock coherent. Configure the platform's build command as `npm ci && npm run build`, start command as `npm start`, health check as `/api/health`, `NODE_ENV=production`, `COLLECTION_INTERVAL_MINUTES=30`, and `DATA_DIR` to the mount path of a persistent disk (for example `/var/data`). Keep one service instance. The runtime serves the Vite bundle and `/api/*` from the same origin, so production CORS is disabled and no API URL is baked into the frontend.

The deployment must support a continuously running process, outbound HTTP requests, and a writable persistent disk. The collector runs in the web process and stops when that process is stopped. Do not deploy this JSON-backed setup to an ephemeral filesystem, serverless functions, or multiple replicas. For hosting without a persistent disk, or when scaling beyond one instance, first move storage to a shared database and collection to one dedicated scheduled worker. No platform has been selected or deployed in this project.

Build assets are cached as immutable for one year; `index.html` is revalidated. `npm run preview` remains a local preview server and is not the production server.

## Known limitations

- JSON file storage is suitable for this small deployment but has no database indexes, concurrent multi-process coordination, or archive retention policy.
- Two source registries exist; only `server/src/sources.ts` is used by the current collector/API.
- Feed categories and geographic scopes use keyword heuristics and may be imperfect.
- External publishers may block images or change feed formats; the UI shows a fallback when images fail.
- No automated unit, API, collector, or browser test suite is currently present.
- Collection and JSON storage are single-process/single-instance; they are not safe for horizontal scaling.
- Build tooling still has advisories in development dependencies; production-only dependencies currently audit clean. See `PRODUCTION_READINESS.md` before release.
