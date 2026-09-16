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

async function getAllOrgnrs(): Promise<string[]> {
  const orgnrs: string[] = [];
  let offset = 0;

  while (true) {
    try {
      const res = await fetch(
        `${API_URL}/api/brfs?limit=${PAGE_SIZE}&offset=${offset}&order_by=name`,
        { next: { revalidate: 21600 } },
      );
      if (!res.ok) break;
      const data = await res.json();
      const brfs: { orgnr: string }[] = data.brfs ?? [];
      orgnrs.push(...brfs.map((b) => b.orgnr));
      if (brfs.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    } catch {
      break;
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

