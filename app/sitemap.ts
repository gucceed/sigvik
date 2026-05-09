import type { MetadataRoute } from 'next';

const BASE = 'https://sigvik.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core ──────────────────────────────────────────────────────────────
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },

    // ── Launch asset ─────────────────────────────────────────────────────
    { url: `${BASE}/sweden`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },

    // ── Persona landings ─────────────────────────────────────────────────
    { url: `${BASE}/contractor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/agent`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },

    // ── Map ───────────────────────────────────────────────────────────────
    { url: `${BASE}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },

    // ── Content ───────────────────────────────────────────────────────────
    { url: `${BASE}/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/om`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/priser`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/leverantorer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/maklare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },

    // ── Legal ─────────────────────────────────────────────────────────────
    { url: `${BASE}/integritet`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/villkor`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },

    // ── BRF pages (33 706 URLs) are served via /brf-sitemap.xml
    // ── Region pages (289 URLs) are served via /region-sitemap.xml
    // Both are referenced in robots.ts and generated dynamically
    // to avoid blocking builds with 170+ API calls.
  ];
}
