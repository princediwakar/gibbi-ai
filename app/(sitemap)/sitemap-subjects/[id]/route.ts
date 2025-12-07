// app/sitemap-subjects/[id]/route.ts
import { createStaticClient } from '@/lib/supabase/static';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const subjectsPerSitemap = 50000;

// Define the params type
interface RouteParams {
  id: string;
}

export async function GET(request: Request, { params }: { params: Promise<RouteParams> }) {
  const resolvedParams = await params; // Await the params Promise
  console.log('[sitemap-subjects] Request received for ID:', resolvedParams.id);

  const page = parseInt(resolvedParams.id) - 1; // '1' → 0, '2' → 1, etc.
  if (isNaN(page) || page < 0) {
    console.error('[sitemap-subjects] Invalid ID format:', resolvedParams.id);
    return new Response('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  console.log(`[sitemap-subjects] Generating sitemap for subjects page: ${page + 1}`);

  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('quiz_with_counts')
    .select('subject')
    .eq('status', 'ready')
    .range(page * subjectsPerSitemap, (page + 1) * subjectsPerSitemap - 1);

  if (error) {
    console.error('[sitemap-subjects] Error fetching subjects:', error);
    return new Response('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  const uniqueSubjects = [...new Set(data.map((quiz) => quiz.subject).filter(Boolean))];
  const subjectRoutes = uniqueSubjects.map((subject) => ({
    url: `${baseUrl}/quizzes/subject/${encodeURIComponent(subject)}`,
    lastModified: new Date().toISOString(),
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${subjectRoutes.map((route) => `<url><loc>${route.url}</loc><lastmod>${route.lastModified}</lastmod></url>`).join('\n')}
</urlset>`;

  console.log(`[sitemap-subjects] Generated ${subjectRoutes.length} entries`);
  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}