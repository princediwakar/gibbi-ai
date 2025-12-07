import { createStaticClient } from '@/lib/supabase/static';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gibbi.vercel.app';
const quizzesPerSitemap = 50000;
const subjectsPerSitemap = 50000;

async function getQuizCount() {
  try {
    const supabase = createStaticClient();
    const { error, count } = await supabase
      .from('quiz_with_counts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ready');
    if (error) throw error;
    console.log(`[sitemap-index] Quiz count: ${count}`);
    return count || 0;
  } catch (error) {
    console.error('[sitemap-index] Error fetching quiz count:', error instanceof Error ? error.message : 'Unknown error');
    return 0;
  }
}

async function getSubjectCount() {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('quiz_with_counts')
      .select('subject')
      .eq('status', 'ready');
    if (error) throw error;
    const uniqueSubjects = [...new Set(data.map((quiz) => quiz.subject))];
    console.log(`[sitemap-index] Subject count: ${uniqueSubjects.length}`);
    return uniqueSubjects.length;
  } catch (error) {
    console.error('[sitemap-index] Error fetching subjects:', error instanceof Error ? error.message : 'Unknown error');
    return 0;
  }
}

export async function GET() {
  console.log('[sitemap-index] Generating sitemap index...');

  const totalQuizzes = await getQuizCount();
  const totalSubjects = await getSubjectCount();
  const totalQuizSitemaps = Math.ceil(totalQuizzes / quizzesPerSitemap);
  const totalSubjectSitemaps = Math.ceil(totalSubjects / subjectsPerSitemap);

  // Create sitemap index XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static pages sitemap
  xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;

  // Add quiz sitemaps
  for (let i = 1; i <= totalQuizSitemaps; i++) {
    xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap-quizzes/${i}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  // Add subject sitemaps
  for (let i = 1; i <= totalSubjectSitemaps; i++) {
    xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap-subjects/${i}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  xml += `
</sitemapindex>`;

  console.log(`[sitemap-index] Generated index with ${1 + totalQuizSitemaps + totalSubjectSitemaps} sitemaps`);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}