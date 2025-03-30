// app/sitemap-quizzes/[id]/route.ts
import { createClient } from '@/lib/supabase/server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const quizzesPerSitemap = 50000;

// Define the params type
interface RouteParams {
  id: string;
}

export async function GET(request: Request, { params }: { params: Promise<RouteParams> }) {
  const resolvedParams = await params; // Await the params Promise
  console.log('[sitemap-quizzes] Request received for ID:', resolvedParams.id);

  const page = parseInt(resolvedParams.id) - 1; // '1' → 0, '2' → 1, etc.
  if (isNaN(page) || page < 0) {
    console.error('[sitemap-quizzes] Invalid ID format:', resolvedParams.id);
    return new Response('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  console.log(`[sitemap-quizzes] Generating sitemap for quiz page: ${page + 1}`);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quiz_with_counts')
    .select('slug, updated_at')
    .eq('status', 'ready')
    .range(page * quizzesPerSitemap, (page + 1) * quizzesPerSitemap - 1);

  if (error) {
    console.error('[sitemap-quizzes] Error fetching quizzes:', error);
    return new Response('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  const quizRoutes = data.map((quiz) => ({
    url: `${baseUrl}/quiz/${quiz.slug}`,
    lastModified: quiz.updated_at ? new Date(quiz.updated_at).toISOString() : new Date().toISOString(),
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${quizRoutes.map((route) => `<url><loc>${route.url}</loc><lastmod>${route.lastModified}</lastmod></url>`).join('\n')}
</urlset>`;

  console.log(`[sitemap-quizzes] Generated ${quizRoutes.length} entries`);
  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}