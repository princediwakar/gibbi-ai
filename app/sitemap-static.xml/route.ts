const baseUrl = 'https://gibbi.vercel.app';

export async function GET() {
  console.log('[sitemap-static] Generating static pages sitemap...');

  const staticPages = [
    { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/quizzes`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/feedback`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/privacy`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/terms`, lastModified: new Date().toISOString() },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
  </url>`).join('')}
</urlset>`;

  console.log(`[sitemap-static] Generated ${staticPages.length} static pages`);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}