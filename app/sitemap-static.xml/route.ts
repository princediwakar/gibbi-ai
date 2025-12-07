// File: app/sitemap-static.xml/route.ts
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gibbi.vercel.app';

export async function GET() {
  console.log('[sitemap-static] Generating static pages sitemap...');

  // Simple array of your static paths
  const routes = [
    '',           // Homepage
    '/quizzes',
    '/feedback',
    '/privacy',
    '/terms',
  ];

  // Current ISO time
  const lastModified = new Date().toISOString();

  // Construct XML using Template Literals (matches your working sitemaps)
  // We trim the URLs to ensure no whitespace issues
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map((route) => {
      return `<url><loc>${baseUrl}${route}</loc><lastmod>${lastModified}</lastmod></url>`;
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