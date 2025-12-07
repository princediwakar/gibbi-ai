const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gibbi.vercel.app';

export async function GET() {
  try {
    console.log('[sitemap-static] Generating static pages sitemap...');

    const staticPages = [
      { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/quizzes`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/feedback`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/privacy`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/terms`, lastModified: new Date().toISOString() },
    ];

    // Generate XML with minimal whitespace
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
  </url>`).join('\n')}
</urlset>`;

    console.log(`[sitemap-static] Generated ${staticPages.length} static pages`);

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[sitemap-static] Error generating sitemap:', error);
    // Return empty valid sitemap to avoid breaking Google Search Console
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    return new Response(emptySitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}