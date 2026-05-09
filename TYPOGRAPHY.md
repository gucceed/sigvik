# Typography — Sigvik

Two typefaces. Three roles. One rule: context determines the font, never the size alone.

---

## Typefaces

| Variable | Loaded as | Purpose |
|----------|-----------|---------|
| `--font-display` | Fraunces (variable, opsz/SOFT/WONK axes) | Brand + editorial |
| `--font-sans` | Inter 400/500 | Dense UI |
| `--font-mono` | JetBrains Mono 400 | Data / code |

---

## The rule

**Fraunces** (`font-display`, `font-body`) — whenever the content is editorial or carries brand identity:
- Hero `h1`, page `h2`, section headings
- BRF names in cards and detail pages
- Verdict numbers (`Stark signal`, score value)
- Body copy in hero, feature descriptions, methodology prose
- `font-display text-display-*` classes

**Inter** (`font-sans`) — whenever the content is UI scaffolding or dense data:
- Navigation links, footer links
- Overlines (the `text-overline uppercase` pattern)
- Filter panel labels, form inputs, button text
- Result card metadata: address, orgnr, municipality, registration year
- Any text at `text-caption` or `text-overline` scale (<14px)
- Search hints, data-source attributions
- Table rows, tag chips, badge text
- `font-sans` class

**JetBrains Mono** (`font-mono`) — codes and numeric identifiers:
- Organisationsnummer display (`769630-0412`)
- Postcodes
- Git SHA in footer
- `font-mono` class

---

## Size scale

Defined in `tailwind.config.ts`. In practice:

| Class | Size | Font | Typical use |
|-------|------|------|-------------|
| `text-display-xl` | 4.5rem | Fraunces | Hero h1 on desktop |
| `text-display-lg` | 3rem | Fraunces | Hero h1 mobile, page titles |
| `text-display-md` | 2.25rem | Fraunces | Section h2 |
| `text-display-sm` | 1.625rem | Fraunces | BRF name in cards, h3 |
| `text-body-lg` | 1.125rem | Fraunces or Inter | Editorial prose, feature answers |
| `text-body` | 1rem | Fraunces or Inter | Standard body |
| `text-body-sm` | 0.875rem | **Inter** | UI secondary text, nav |
| `text-caption` | 0.75rem | **Inter** | Metadata, attribution, timestamps |
| `text-overline` | 0.6875rem | **Inter** | Section labels, uppercase tags |

---

## Anti-patterns

- Never use `font-sans` for a BRF name, score, or section heading
- Never use `font-display` for nav links, filter labels, or orgnr
- Never mix font families within a single sentence
- `text-overline uppercase` always uses `font-sans` — add it explicitly when not inherited
