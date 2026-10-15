# Klimavani — Digital Climate Newspaper

**Klimavani** (*Klima* meaning climate, *Vani* meaning voice / chronicle) is a modern, high-typography personal digital climate newspaper designed to bring journalistic structure, visual elegance, and scientific discipline to global environmental coverage.

Phase 1 establishes the design system, editorial masthead, dynamic date and wire updates, hero storytelling, category desks, filtering and search mechanics, and responsive newspaper grid.

---

## 🏛️ Brand & Editorial Philosophy

Klimavani departs from generic SaaS dashboard styling, neon accents, and excessive cards. Instead, it adopts the dignity and visual hierarchy of classic print and editorial broadsheets:
- **Palette**: Deep forest green (`#143126`), warm archival newsprint paper background (`#fbf9f4`), charcoal typography (`#19201d`), muted sage accents, and restrained crimson wire badges.
- **Typographic System**: High-contrast editorial serifs (*Newsreader* / *Playfair Display*) paired with legible sans-serif body typography (*Plus Jakarta Sans* / *Inter*).
- **Integrity**: Clear institutional attribution, preserving scientific fidelity without speculative claims or AI distortion.

---

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with custom editorial color schemes, hairline dividers, and custom typography
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Architecture

```
Klimavani/
├── data/
│   └── sources.py                 # Preserved data pipeline hook for Phase 2
├── public/
│   └── images/                    # Local image assets and photography
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── EmptyState.tsx         # Empty state display with query feedback & reset
│   │   │   ├── FilterControls.tsx     # Category chips, sort dropdown, and article counters
│   │   │   ├── ImageWithFallback.tsx  # Graceful fallback handler for broken/missing photos
│   │   │   └── SearchInput.tsx        # Search input with clear button
│   │   ├── layout/
│   │   │   ├── Footer.tsx             # Newspaper footer with source index & back-to-top
│   │   │   └── Header.tsx             # Vol./Issue masthead, dynamic date, weather benchmark, mobile nav
│   │   ├── navigation/
│   │   │   └── BreakingTicker.tsx     # Animated wire ticker with pause/play & accessible controls
│   │   └── news/
│   │       ├── ArticleModal.tsx       # Dispatch reader modal with original source attribution
│   │       ├── FeaturedStory.tsx      # Prominent hero editorial section
│   │       ├── NewsCard.tsx           # Standard editorial card with tag badges & external links
│   │       └── NewsGrid.tsx           # Responsive 3-column news grid
│   ├── data/
│   │   └── mockArticles.ts        # Realistic climate articles & breaking ticker items
│   ├── hooks/
│   │   └── useNewsFilter.ts       # State management for search, category filtering, and sorting
│   ├── pages/
│   │   └── HomePage.tsx           # Primary newspaper layout
│   ├── styles/
│   │   └── index.css              # Editorial hairline rules, ticker keyframes, custom scrollbars
│   ├── types/
│   │   └── news.ts                # TypeScript interfaces (Article, ClimateCategory, FilterOptions)
│   ├── utils/
│   │   └── date.ts                # Masthead & article date formatting utilities
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # Vite DOM entrypoint
├── index.html                     # HTML5 template with Google Fonts
├── package.json                   # Dependencies & scripts
├── postcss.config.js              # PostCSS plugins
├── tailwind.config.js             # Tailwind design system tokens
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler configuration
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (Tested on v26.7.0)
- **npm**: v9.0.0 or later (Tested on v11.19.0)

### Installation
```bash
# Clone or navigate into the Klimavani root folder
cd Klimavani

# Install project dependencies
npm install
```

### Development Server
```bash
# Terminal 1: Start Express Data API & Background Collector (Port 5000)
npm run server

# Terminal 2: Start Vite Frontend (Port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Verification
```bash
# Compile TypeScript and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ⚡ End-to-End Live Data Pipeline (Phase 2)

```
Verified RSS feeds and public APIs
                 |
                 v
         Node.js collector
                 |
                 v
      Parse and normalize records
                 |
                 v
       Validate and deduplicate
                 |
                 v
          Store articles
                 |
                 v
        Express REST API
                 |
                 v
        Klimavani frontend
                 |
                 v
       News cards + images
```

### Pipeline Components:
1. **Verified Sources (`server/src/sources.ts`)**: Authoritative RSS feeds and public endpoints including NASA Earth Observatory, NOAA, Phys.org, UN Climate News, ScienceDaily, Carbon Brief, and Mongabay.
2. **Collector (`server/src/collector.ts`)**: Parallel feed retrieval with custom User-Agent, timeouts, error isolation per feed, and automatic 30-minute background scheduling.
3. **Parser & Normalizer (`server/src/normalizer.ts`)**: Strips raw HTML, decodes entities, extracts media/enclosure image URLs, detects climate categories and geographic regions based on editorial keywords, and generates concise editorial teasers.
4. **Validator & Deduplicator (`server/src/validator.ts`)**: Canonicalizes URLs (stripping tracking UTM tags), eliminates duplicate dispatches across syndicates, and enforces strict schema compliance.
5. **Storage Engine (`server/src/storage.ts`)**: Atomic, persistent JSON storage at `data/articles.json` with fallback offline seed records.
6. **Express REST API (`server/src/index.ts`)**:
   - `GET /api/articles` (supports `?category=`, `?search=`, `?sort=`, `?limit=`)
   - `GET /api/ticker` (active breaking climate updates)
   - `GET /api/sources` (configured feeds catalogue)
   - `POST /api/refresh` (on-demand collector re-trigger)
   - `GET /api/health`
7. **Klimavani Frontend (`src/hooks/useNewsData.ts`)**: Real-time integration via Vite reverse proxy with live sync indicators, refresh triggers, and instant news card updates.

