# Sigvik

Sveriges BRF-intelligens — ekonomi, avgift, energiklass och underhållsrisk för bostadsrättsföreningar.

## Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript** (strict)
- **Tailwind CSS** with custom editorial Nordic design tokens
- **Fraunces** (display + body) via `next/font/google`
- **Vercel** deployment

## Ground rules

- No Inter, no Roboto, no system fonts
- No purple gradients
- Editorial Nordic aesthetic — paper base, deep ink, sage/amber risk palette, single deep-red accent
- Plain Swedish throughout
- Mobile-first (360px baseline up)
- All user-facing copy must be plain Swedish, no untranslated jargon

## Scripts

```bash
npm install
npm run dev      # localhost:3000
npm run build    # production build
npm run start    # run production build
npm run typecheck
```

## Structure

```
app/
  layout.tsx          Root layout + font loading + SEO
  page.tsx            Homepage (address-first search)
  globals.css         Design tokens + Tailwind layers
  not-found.tsx       404
  robots.ts           robots.txt
  sitemap.ts          sitemap.xml
  api/
    health/route.ts   /api/health — status, commit, deployedAt
tailwind.config.ts    Design tokens in Tailwind extend
next.config.mjs       Production config
```

## Health check

```bash
curl https://sigvik.com/api/health
```

Returns `{status, service, commit, deployedAt, region}`.

## Roadmap

Sequenced in `PROMPTS.md`:

- **Prompt 1** (done) — Domain, deployment, design foundation, `/api/health`
- **Prompt 2** — Full DESIGN.md, 8 UI primitives, `/design` showcase route
- **Prompt 3** — Address → BRF → verdict resolution (backend `/api/v1/resolve`)
- **Prompt 4** — Verdict-first BRF page (`/brf/[slug]`)
- **Prompt 5** — Instant paid report flow (Stripe, in-browser delivery)
- **Prompt 6** — Skåne map with intent-score overlay (`/karta`)
- **Prompt 7** — Contractor portal (`kontraktor.sigvik.com`)

## Licence

Private — property of Norric AB.
