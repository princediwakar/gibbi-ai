// File: app/sitemap-static/route.ts
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gibbi.vercel.app';

export async function GET() {
  console.log('[sitemap-static] Generating static pages sitemap...');

  const routes = [
    '',           // Homepage
    '/quizzes',
    '/feedback',
    '/privacy',
    '/terms',
  ];

  const lastModified = new Date().toISOString();

  // We use a clean template literal to avoid XML formatting issues
  // The URL in <loc> will be constructed cleanly
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