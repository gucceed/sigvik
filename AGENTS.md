# Sigvik Project Instructions

Sigvik is a Swedish BRF intelligence platform. The product is not a website — it is a structured data API over Swedish BRF public data (Bolagsverket, lantmäteriet, municipality registers) that currently surfaces via a web UI. The web frontend is a distribution channel. The API is the business.

## ARCHITECTURE MENTAL MODEL
- Core asset: data ingestion pipeline, cleaning logic, and scoring engine beneath the UI
- Primary interface (near-term): React/TypeScript web app at sigvik.com for human buyers and contractors
- Primary interface (medium-term): REST API and MCP server for agent-native consumption
- The web UI is the demo layer and human onboarding surface. The API is the revenue layer.

## PRODUCT TIERS
1. Free public tool — humans, browser-based, builds trust and SEO
2. Contractor B2B SaaS — mäklare and entrepreneurs; API access is the primary deliverable, UI is the bonus
3. Marketplace — future; agent-queryable listings layer

## API SURFACE (to be built)
Five core endpoints every feature decision should assume will exist:
- GET /brf/{address} — BRF lookup and metadata
- GET /brf/{id}/score — composite risk/health score
- GET /brf/{id}/avgift — avgift history and trend
- GET /brf/{id}/flags — renovation risk, ekonomisk risk flags
- GET /brf/comparable — comparable BRF query by parameters

## MCP SERVER
Sigvik exposes an MCP server definition so any Swedish AI assistant, real estate agent workflow, or mortgage pre-approval agent can call Sigvik as a tool. Every new data signal added to the scoring engine is also exposed as an MCP tool.

## DESIGN PRINCIPLES
- Agent-readable first: every score, flag, and data point must be returnable as clean JSON, not just rendered in UI components
- Structured over narrative: outputs are typed, enumerable, machine-parseable
- No data trapped in UI: if it renders on screen, it must also be queryable via API
- Humans and agents are co-equal consumers of the same underlying data layer

## STACK
- React / TypeScript / Tailwind — web frontend
- Vercel — hosting
- Google AI Studio — AI layer
- REST API — to be built alongside existing frontend, not replacing it

## CURRENT STATE
sigvik.com is live. Web UI is functional. API does not yet exist. MCP server does not yet exist. All new features should be designed with both the web UI rendering AND the API JSON response in mind simultaneously.
