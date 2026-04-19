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
Last updated: 2026-04-19

✅ WORKING
- Next.js 14 App Router scaffold deployed to Vercel
- sigvik.com serves real frontend (Google AI Studio placeholder replaced)
- /api/health endpoint returns {status, commit, deployedAt, region}
- Editorial Nordic design system base (Fraunces serif, paper/ink palette, no Inter, no purple)
- Mobile-first homepage with address search input
- Proper SEO (OG tags, sitemap, robots, Swedish lang)

🟡 IN PROGRESS
- Backend /api/v1/resolve endpoint for address → BRF matching (Prompt 3)
- DESIGN.md formal spec with 8 UI primitives (Prompt 2)

⏸ UPCOMING
- BRF detail page /brf/[slug] with verdict grade (Prompt 4)
- Stripe-powered paid report flow (Prompt 5)
- Skåne/national map at /karta (Prompt 6)
- Contractor portal at kontraktor.sigvik.com (Prompt 7)
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
