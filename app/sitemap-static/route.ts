// File: app/sitemap-static/route.ts
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gibbi.vercel.app';

interface StaticRoute {
  url: string;
  changeFrequency?: string;
  priority?: number;
}

export async function GET() {
  console.log('[sitemap-static] Generating static pages sitemap...');

  const routes: StaticRoute[] = [
    { url: '' },           // Homepage
    { url: '/quizzes' },
    { url: '/feedback' },
    { url: '/privacy' },
    { url: '/terms' },
    { url: '/insights', changeFrequency: 'weekly', priority: 0.8 },
  ];

  const lastModified = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map((route) => {
      const changefreq = route.changeFrequency
        ? `<changefreq>${route.changeFrequency}</changefreq>`
        : '';
      const priority = route.priority !== undefined
        ? `<priority>${route.priority}</priority>`
        : '';
      return `<url><loc>${baseUrl}${route.url}</loc><lastmod>${lastModified}</lastmod>${changefreq}${priority}</url>`;
    })
    .join('')}
</urlset>`;

  console.log(`[sitemap-static] Generated ${routes.length} static pages`);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
