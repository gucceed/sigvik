import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/design'],
      },
    ],
    sitemap: [
      'https://sigvik.com/sitemap.xml',      // static pages
      'https://sigvik.com/brf-sitemap.xml',  // 33 706 BRF pages
    ],
  };
}
