# Qisas — قِصَص

**Find yourself in the stories of those who came before.**

A reflective Islamic app that connects what you're going through to the wisdom of the Quran and the Prophet's life ﷺ.

## How It Works

1. **Share** what you're going through — in your own words
2. **Match** your emotion to Islamic themes (sabr, tawakkul, adl, etc.)
3. **Receive** a Quran verse with Arabic text and English translation
4. **Discover** a seerah story with lessons, hadith references, and location

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS
- **Database:** Supabase (PostgreSQL) — 46 seerah events, 857 hadiths, 30 tags, 30 persons
- **Quran API:** [Quran Foundation API](https://api.quran.com) — 126+ translations
- **Deployment:** Cloudflare Pages

## Data

| Entity | Count |
|--------|-------|
| Seerah events | 46 |
| Thematic tags | 30 |
| Historical persons | 30 |
| Locations | 18 |
| Hadith sources | 857 |
| Event-tag links | 123 |
| Event-source links | 818 |
| Event-person links | 80 |

## The Flow

```
User input ("I feel lost")
  → Emotion matching (purpose, ikhlas, tawhid)
  → Quran API search ("purpose of creation")
  → Supabase: get_events_by_tags(["ikhlas", "tawhid"])
  → Render: verse + seerah story + hadith
```

## Screens

- `/` — Home: "What are you going through?" input
- `/result?q=...` — Results: Quran verse + seerah stories
- `/event/[id]` — Event detail: full story, hadiths, location
- `/about` — How Qisas works

## Running Locally

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Run development server
npm run dev
```

## Deploying to Cloudflare Pages

```bash
# Build for Cloudflare
npx @cloudflare/next-on-pages

# Deploy
wrangler pages deploy .vercel/output/static --project-name=qisas
```

## Project Structure

```
qisas/
├── app/                          # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Home (input)
│   │   │   ├── result/           # Results page
│   │   │   ├── event/[id]/       # Event detail
│   │   │   └── about/            # About page
│   │   ├── components/
│   │   │   ├── Header.tsx        # Navigation + theme toggle
│   │   │   └── ThemeProvider.tsx # Dark/light mode
│   │   └── lib/
│   │       ├── supabase.ts       # Supabase client
│   │       └── qisas-engine.ts   # Emotion matching + API
│   └── tailwind.config.ts
├── data/
│   ├── emotion_tag_map.json      # 20 emotion categories
│   ├── quran_search_terms.json   # Tag → search term mapping
│   ├── hadith_seerah_refs.json   # 2,241 Bukhari hadiths
│   └── hadith_muslim_seerah.json # 1,130 Muslim hadiths
├── sql/
│   ├── seerah_schema.sql         # Database schema
│   └── qisas_api_functions.sql   # Supabase SQL functions
└── docs/
    └── project-description.md    # Full project description
```

## License

MIT
