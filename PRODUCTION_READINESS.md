# Klimavani production readiness plan

**Review date:** 19 October 2026  
**Decision:** ready for a production-shaped staging deployment; not approved for a public production launch yet.  
**Recommended baseline:** one always-on Node.js 24 LTS web service, one instance, one mounted persistent data directory, and same-origin UI/API. No cloud account or hosting target is selected, so no deployment has been performed.

## Product fit

The current dashboard is a climate news feed: RSS headlines, source descriptions, publication dates, categories, image fallbacks, search, filtering, and attribution. It is useful for “What’s happening?” and partially supports “What’s changing scientifically/politically?” through broad news feeds. It does not yet provide climate observations or datasets, official regulation tracking, primary research metadata, or a structured learning/project library. The UI and source rules should not imply it answers those questions until those source types are integrated and verified.

Keep the product deterministic and source-led. The current categorization uses keyword rules. Do not add generated summaries, climate projections, recommendations, or other AI features as part of production hardening.

## Production shape and rationale

```text
Browser
  └─ HTTPS edge / reverse proxy
      └─ One Node.js web service
          ├─ Vite production assets
          ├─ Express /api endpoints
          ├─ One scheduled RSS collector
          └─ DATA_DIR/articles.json on persistent disk
```

This is the smallest deployment that matches the implemented system. The browser uses relative `/api` requests; the server now serves the built frontend and API on the same origin. `DATA_DIR` points the JSON archive at a mounted volume. Keep one instance because the collection lock is in memory and the JSON file is not a shared, multi-process database. If the host cannot keep a Node process running or provide persistent writable storage, this architecture is not suitable as-is.

## Work completed in this readiness pass

- Added production static-file serving and SPA fallback to Express; API routes remain JSON endpoints.
- Disabled CORS in production for the same-origin deployment and retained a narrow localhost CORS rule for Vite development.
- Wired `DATA_DIR` into JSON storage and removed the unused SQL.js dependency and misleading `DB_PATH` configuration.
- Moved `tsx` to production dependencies so `npm start` works when development dependencies are omitted.
- Added Node.js 24+ engine guidance and `.nvmrc` set to 24.
- Added server and frontend TypeScript checks to `npm run typecheck` and made the production build run both.
- Added graceful timer/server shutdown, disabled the Express signature header, bounded configuration values, and lengthened manual collection cooldown to five minutes.
- Added production cache headers for hashed assets and revalidation for `index.html`.
- Removed mock ticker headlines from offline states and stopped displaying source-description excerpts as direct quotations.
- Updated the [README](README.md) with the deployment shape, exact commands, health check path, and persistent storage requirement.

## Release blockers and action plan

### P0 — Staging and reliability gates

1. **Select the hosting target and provision persistent storage.** Set `NODE_ENV=production`, `PORT` from the host, `COLLECTION_INTERVAL_MINUTES=30`, and `DATA_DIR` to the persistent mount. Build with `npm ci && npm run build`, start with `npm start`, and configure `/api/health` as the health check.
2. **Run staging on Node.js 24 LTS.** This workspace was checked with its installed runtime, not Node 24; run the complete build and production smoke suite on the pinned LTS before launch.
3. **Add automated tests.** There is no automated unit/API/browser suite yet. Add coverage for malformed/empty dates, unsafe URLs, duplicate records, title preservation, missing images, source failure isolation, no-source-success archive preservation, storage read/write errors, API validation/pagination, refresh cooldown, and repeated collection.
4. **Run browser acceptance at phone, tablet, and desktop widths.** Verify search, categories, sorting, empty/loading/error states, long titles, external links, failed images, and no horizontal overflow. The prior production build succeeded, but no browser visual acceptance has been completed.
5. **Exercise deployment failure and recovery.** Confirm an unavailable feed does not remove stored stories, restart the process and verify archive persistence, test health failures, and rehearse a backup restore before public launch.

### P1 — Security and operations

1. **Resolve build-tool advisories.** `npm audit --omit=dev` reports zero production vulnerabilities. Full `npm audit` reports seven development-tool findings (five high, two moderate) in Tailwind 3’s dependency chain (`braces` and `postcss-selector-parser`). `npm audit fix --force` proposes Tailwind 4, a breaking upgrade. Upgrade Tailwind and verify the design in a separate, tested change before treating the full toolchain as clean.
2. **Set up dependency and build review in CI.** Run lockfile-based install, `npm run typecheck`, `npm run build`, production-only and full dependency audits. Review major dependency updates deliberately.
3. **Create an archive backup/restore procedure.** The JSON file is written atomically but has no automatic backup, retention, database indexes, or transaction support. Keep backups off the service volume and periodically rehearse restore. Do not add an arbitrary short retention limit.
4. **Watch source-level collection outcomes.** Alert on repeated zero-source-success runs and disk/write failures. The current health response exposes recent in-process collection state; it resets on process restart, while `lastDataUpdated` is persisted.
5. **Revisit manual refresh exposure.** The endpoint is public and globally throttled for five minutes per process. That is acceptable for a small single-instance staging service; before a larger public launch, add a durable rate limit or disable the public trigger and rely on the scheduler.

### P2 — Deliver the climate-intelligence vision in evidence-backed increments

1. **Events:** improve coverage by event type and geography using tested publisher/government sources; label the publisher and publication time.
2. **Data:** add a separate data-release desk for authoritative observations, historical series, and datasets. Store provider, release date, geographic/temporal coverage, and direct dataset URL; distinguish measured data from news about data.
3. **Research:** add primary-paper metadata/links and clearly separate papers from secondary reporting. Preserve DOI, publisher, publication date, and abstract/description as supplied.
4. **Policy:** curate official government and intergovernmental notices, regulations, consultations, and adaptation plans. Link to the primary legal/policy document and show jurisdiction and effective/publication dates.
5. **Learn/build:** create a small, source-attributed case-study and dataset catalogue with methods, geographic scope, and reproducibility links. Keep it editorially curated, not recommended by a model.

Ship each desk only after its source list, parsing behavior, attribution, and failure cases have been checked. Do not present a source as operational based only on configuration.

## Acceptance checklist for public launch

- [ ] Hosting target and persistent disk are configured; service is pinned to Node 24 LTS.
- [ ] Production web process serves both built UI and `/api`; restart preserves the archive.
- [ ] Automated frontend, backend, collector, storage, and API tests pass.
- [ ] Browser review passes on phone, tablet, and desktop.
- [ ] Feed failures preserve existing records and surface source-specific status.
- [ ] Disk backup and restore have been rehearsed.
- [ ] Dependency advisories are resolved or explicitly accepted with a tracked Tailwind upgrade.
- [ ] Public refresh endpoint policy is decided.
- [ ] Product copy accurately describes the currently implemented RSS news feed and does not claim datasets, regulations, or primary research coverage that is not present.

## Current commands

```sh
npm ci
npm run typecheck
npm run build
NODE_ENV=production npm start
```

On Windows PowerShell, set production mode with `$env:NODE_ENV='production'` before `npm start`. Configure `PORT` and `DATA_DIR` through the hosting platform rather than committing secrets or host-specific values.

## Guidance reviewed

- Express recommends production `NODE_ENV`, an LTS Node release, restart supervision, and reverse-proxy support: [Express production performance and reliability](https://expressjs.com/en/advanced/best-practice-performance/).
- Vite documents `dist` as the deployable output and states `vite preview` is for local preview, not production serving: [Vite static deployment](https://vite.dev/guide/static-deploy).
- Node.js lists Node 24 as LTS and advises production applications use Active or Maintenance LTS: [Node.js release schedule](https://nodejs.org/en/about/previous-releases).
- Hosting behavior depends on provider. For example, Render documents ephemeral filesystems by default and persistent-disk limitations: [Render persistent disks](https://render.com/docs/disks).
