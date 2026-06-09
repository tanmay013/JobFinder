# Senior Frontend Job Finder

A modern Next.js dashboard for discovering Senior Frontend Engineer hiring posts from LinkedIn (via Apify), JSON uploads, or authorized APIs.

## Features

- **Responsive dashboard** with search, filters, stats cards, and paginated results table
- **Hiring detection** — matches role keywords (senior frontend engineer, react developer, etc.)
- **Email extraction** — keeps only posts with valid contact emails
- **Experience matching** — filters by 2-4 years, 3+, 3-5 years, mid-level frontend
- **Relevance scoring** — ranks posts by keyword and experience signals
- **Export** — download filtered results as CSV, Excel, or JSON
- **LinkedIn integration** — fetches via Apify every 6 hours, serves from local file between fetches

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- shadcn/ui (Radix primitives)
- TanStack React Query
- Zustand
- xlsx (Excel export)
- ESLint + Prettier

## Project Structure

```
src/
├── app/                    # Next.js routes + API
│   └── api/posts/          # GET LinkedIn posts, POST process
├── components/
│   ├── providers/          # React Query provider
│   └── ui/                 # shadcn/ui components
├── features/
│   ├── dashboard/          # Stats, filters, table, pagination
│   ├── export/             # CSV / Excel / JSON export
│   ├── linkedin/           # Apify client, cache, daily rate limit
│   └── posts/              # Types, processing, hooks
├── lib/                    # API client, utilities
└── stores/                 # Zustand dashboard store
```

## Quick Start

```bash
cd JobFinder
cp .env.example .env.local   # add APIFY_API_TOKEN (same as JobHunter)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Sources

### LinkedIn via Apify (default)

On load, the dashboard reads posts from a local server file (`data/linkedin-posts.json`). Apify is called when **no local data exists** or the last fetch is older than 6 hours.

**LinkedIn posts** (hiring announcements from recruiters/employees) are fetched via the [Apify](https://apify.com) actor `harvestapi~linkedin-post-search` — an authorized third-party service, not direct scraping. This searches the LinkedIn **content feed** for hiring posts that often include contact emails, unlike formal job listings.

- **Local file:** Posts are saved to `data/linkedin-posts.json` on the server after each Apify fetch
- **6-hour interval:** Apify is called at most once every 6 hours; all other loads read from the local file
- **Manual fetch:** The **Fetch now** button only calls Apify once the 6-hour window has passed

```bash
# Serve from local file (calls Apify only if stale or empty)
curl http://localhost:3000/api/posts

# Request fetch — still serves local file if within the 6-hour window
curl "http://localhost:3000/api/posts?refresh=true"
```

| Variable | Purpose |
|---|---|
| `APIFY_API_TOKEN` | Apify API token (required) |
| `APIFY_ACTOR_ID` | LinkedIn post search actor (default: `harvestapi~linkedin-post-search`) |
| `LINKEDIN_SEARCH_QUERIES` | Comma-separated hiring search queries |
| `LINKEDIN_POSTED_LIMIT` | Recency filter (default: `week`) |
| `LINKEDIN_MAX_POSTS_PER_FETCH` | Posts per Apify fetch (default: 30) |
| `LINKEDIN_FETCH_INTERVAL_HOURS` | Hours between Apify calls (default: 6) |
| `LINKEDIN_CACHE_FILE` | Local storage path (default: `data/linkedin-posts.json`) |

### JSON Upload

Click **Upload JSON** and provide an array of posts:

```json
[
  {
    "postId": "unique-id",
    "author": "Jane Doe",
    "content": "Hiring Senior Frontend Engineer, 3+ years. Apply: jane@company.com",
    "date": "2026-06-09T10:00:00.000Z",
    "company": "Acme Inc",
    "postUrl": "https://example.com/post/1"
  }
]
```

A sample file is available at `public/sample-posts.json`.

### External API

Point your own authorized API at the processing endpoint:

```bash
curl -X POST http://localhost:3000/api/posts/process \
  -H "Content-Type: application/json" \
  -d '{"posts": [...], "filters": {"roleKeyword": "", "experienceRange": "all", "postedDateFrom": null, "postedDateTo": null}}'
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format |
| `npm run typecheck` | TypeScript check |

## Important

This application processes only data from APIs, uploaded files, or other authorized sources. It does not implement scraping, login automation, or techniques that violate platform terms of service.
