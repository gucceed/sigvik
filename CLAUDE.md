# CLAUDE.md — Sigvik Frontend

> Read this file at the start of every session. Update the STATUS section after every meaningful change.

## Project identity

**Product:** Sigvik — Sveriges BRF-intelligens
**Repo:** gucceed/sigvik
**Owner:** Norric AB (Edgar Mutebi, Malmö, SE)
**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · Vercel
**Live URL:** https://sigvik.com
**Backend:** `gucceed/sigvik-backend` (FastAPI on Railway)
**Database:** Supabase Postgres (project: xmifxnhpufsckihregym)

---

## What this product does

Sigvik is a BRF intelligence product for Sweden. A user enters an address anywhere in Sweden, Sigvik returns the bostadsrättsförening's economic health, årsavgift trend, energiklass and maintenance risk in under a second. Data comes directly from Bolagsverket (årsredovisningar), Boverket (energideklarationer) and Skatteverket.

**National coverage from day one.** ~45 000 registered bostadsrättsföreningar across all 290 Swedish municipalities. No regional rollout — every BRF in the Bolagsverket register is searchable.

Consumer surface: `sigvik.com` — the website.
API surface: `sigvik.com/api/v1/*` — used by mäklare, banks and property tech.
Contractor surface (Prompt 7): `kontraktor.sigvik.com` — lead discovery for stambyte / tak / fasad contractors.

---

## Current STATUS

```
Last updated: 2026-05-10

✅ WORKING
- Next.js 14 App Router scaffold deployed to Vercel
- sigvik.com serves real frontend
- /api/health endpoint returns {status, commit, deployedAt, region}
- Editorial Nordic design system (Fraunces + Inter + JetBrains Mono, paper/ink palette)
- Mobile-first homepage with address search, national launch strip, persona entry cards
- Proper SEO (OG tags, sitemap, robots, Swedish lang)
- Component library: GradeChip, ScoreBar, UncertaintyNote, SourceBadge, TrendArrow,
  SignalRow, DataPoint, ProgressRing, AvgiftChart, LaunchStrip
- BRF detail page /brf/[orgnr]:
    - Ink header with GradeChip (A–F derived from financial data)
    - ScoreBar with confidence indicator and UncertaintyNote gating
    - Key metrics 2×2 grid (avgift/kvm, skuld/lgh, underhållsfond/lgh, energiklass)
    - Avgift trend line chart (Recharts, dynamically imported)
    - Underhållssignaler with SignalRow + lifecycle fallback
    - Persona blocks: buyer/agent/contractor
    - Rapport view (?view=rapport) — print-optimised PDF layout
    - Data sources collapsible
    - Three CTAs (köparrapport, dela, bevaka)
- National coverage: 33 706 BRFs, 289 municipalities
- recharts installed for trend chart

🟡 IN PROGRESS
- Backend /api/v1/resolve endpoint wiring
- Search page sidebar layout (filter panel + map toggle)

⏸ UPCOMING
- /sweden municipal health map (react-simple-maps)
- Stripe-powered paid report flow
- Contractor portal at kontraktor.sigvik.com
```

---

## Gating dependencies

- **`/api/health` live** → unlocks: uptime monitoring on sigvik.com
- **Backend `/api/v1/resolve`** → unlocks: real address search in homepage
- **Full DESIGN.md** → unlocks: consistent visual language across all subsequent prompts
- **National Bolagsverket ingestion** → unlocks: coverage beyond 3,582 Skåne BRFs

---

## Design non-negotiables

- Display and body font: **Fraunces** (via next/font/google)
- Mono: **JetBrains Mono**
- Paper base: `#F6F2EB` (not pure white)
- Ink: `#1A1A1A` body text
- Accent: deep red `#8B2E2E` — reserved for CTAs and primary actions
- Risk palette: sage `#5F7A5F` / amber `#C08B3C` / signal red `#B04040`
- No Inter, no Roboto, no system fonts
- No purple gradients
- Plain Swedish throughout — no untranslated jargon

---

## Environment variables

```
# Public (exposed in browser)
NEXT_PUBLIC_COMMIT_SHA          # Vercel injects VERCEL_GIT_COMMIT_SHA at build
NEXT_PUBLIC_DEPLOYED_AT         # computed at build

# Server-only (for future API routes)
SIGVIK_BACKEND_URL              # Railway sigvik-backend URL
SIGVIK_BACKEND_API_KEY          # Internal auth between frontend and backend
```

---

## How to run locally

```bash
npm install
npm run dev      # localhost:3000
```

---

## Exception thresholds (agent rules)

Surface immediately — do not proceed silently:

- Build fails on Vercel
- Lighthouse Performance mobile drops below 85
- Lighthouse Accessibility drops below 95
- `/api/health` returns non-200 status
- Any Inter, Roboto or system-ui font loads at runtime
- Any purple gradient renders anywhere on the site

---

## Norric portfolio context

Part of Norric AB's portfolio. Shared dependencies:

- Bolagsverket ingestion pipeline (sigvik-backend) also feeds Kreditvakt and Vigil
- MCP server: norric-mcp-production.up.railway.app
- Portfolio domains: norric.io, sigvik.com, kreditvakt.com

All IP owned by Norric AB.
