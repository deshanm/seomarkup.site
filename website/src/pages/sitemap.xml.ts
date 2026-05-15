import type { APIRoute } from 'astro';

const SITE = 'https://www.seomarkup.site';

const pages = [
  { url: '/',                              priority: '1.0', changefreq: 'weekly'  },
  { url: '/schema-generator/',             priority: '0.9', changefreq: 'monthly' },
  { url: '/rich-result-preview/',          priority: '0.9', changefreq: 'monthly' },
  { url: '/schema-cheat-sheet/',           priority: '0.8', changefreq: 'monthly' },
  { url: '/resources/',                    priority: '0.8', changefreq: 'weekly'  },
  { url: '/how-google-uses-structured-data/', priority: '0.7', changefreq: 'monthly' },
  { url: '/ecommerce-structured-data/',    priority: '0.7', changefreq: 'monthly' },
  { url: '/llms-and-structured-data/',     priority: '0.7', changefreq: 'monthly' },
  { url: '/tools/',                        priority: '0.6', changefreq: 'monthly' },
  { url: '/privacy/',                      priority: '0.3', changefreq: 'yearly'  },
  { url: '/terms/',                        priority: '0.3', changefreq: 'yearly'  },
];

export const GET: APIRoute = () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${SITE}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
