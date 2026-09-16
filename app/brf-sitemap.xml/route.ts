/**
 * Dynamic BRF sitemap — streams all 33 706 BRF URLs as sitemap XML.
 *
 * Served at /brf-sitemap.xml and referenced from robots.txt.
 * Generated on-demand (not at build time) to avoid blocking builds.
 * ISR-cached for 6h: the full ~170-page API sweep only re-runs on
 * revalidation, so crawlers no longer trigger ~170 API calls per sitemap hit.
 */

export const revalidate = 21600; // 6h — BRF data changes on nightly ingestion

const API_URL =
  process.env.NEXT_PUBLIC_SIGVIK_API_URL ||
  'https://sigvik-backend-production.up.railway.app';

const BASE = 'https://sigvik.com';
const PAGE_SIZE = 200;

interface BrfsPage {
  brfs: { orgnr: string }[];
  total?: number;
}

async function fetchPage(offset: number): Promise<BrfsPage | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/brfs?limit=${PAGE_SIZE}&offset=${offset}&order_by=name`,
      { next: { revalidate: 21600 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as BrfsPage;
  } catch {
    return null;
  }
}

// Fetched in parallel batches: the route is prerendered at build time (ISR),
// and ~170 sequential round-trips blow the 60s static-generation timeout.
async function getAllOrgnrs(): Promise<string[]> {
  const first = await fetchPage(0);
  if (!first) return [];

  const orgnrs: string[] = first.brfs.map((b) => b.orgnr);
  const total = first.total ?? first.brfs.length;

  const offsets: number[] = [];
  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
    offsets.push(offset);
  }

  const CONCURRENCY = 10;
  for (let i = 0; i < offsets.length; i += CONCURRENCY) {
    const pages = await Promise.all(offsets.slice(i, i + CONCURRENCY).map(fetchPage));
    for (const page of pages) {
      if (page) orgnrs.push(...page.brfs.map((b) => b.orgnr));
    }
  }

  return orgnrs;
}

export async function GET() {
  const orgnrs = await getAllOrgnrs();

  const urls = orgnrs
    .map(
      (o) =>
        `  <url>\n    <loc>${BASE}/brf/${o}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}


