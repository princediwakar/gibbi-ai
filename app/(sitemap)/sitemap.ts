// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const quizzesPerSitemap = 50000;
const subjectsPerSitemap = 50000;

async function getQuizCount() {
  try {
    const supabase = await createClient();
    const { error, count } = await supabase
      .from('quiz_with_counts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ready');
    if (error) throw error;
    console.log(`[sitemap] Quiz count: ${count}`);
    return count || 0;
  } catch (error) {
    console.error('[sitemap] Error fetching quiz count:', error);
    return 0;
  }
}

async function getSubjectCount() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('quiz_with_counts')
      .select('subject')
      .eq('status', 'ready');
    if (error) throw error;
    const uniqueSubjects = [...new Set(data.map((quiz) => quiz.subject))];
    console.log(`[sitemap] Subject count: ${uniqueSubjects.length}`);
    return uniqueSubjects.length;
  } catch (error) {
    console.error('[sitemap] Error fetching subjects:', error);
    return 0;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log('[sitemap] Generating root sitemap.xml...');
  console.log('[sitemap] Base URL:', baseUrl);

  const totalQuizzes = await getQuizCount();
  const totalSubjects = await getSubjectCount();
  const totalQuizSitemaps = Math.ceil(totalQuizzes / quizzesPerSitemap);
  const totalSubjectSitemaps = Math.ceil(totalSubjects / subjectsPerSitemap);

  const staticPages = [
    { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/quizzes`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/feedback`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/privacy`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/terms`, lastModified: new Date().toISOString() },
  ];

  const quizSitemapIndex = Array.from({ length: totalQuizSitemaps }, (_, i) => ({
    url: `${baseUrl}/sitemap-quizzes/${i + 1}`, // Simplified to /sitemap-quizzes/1
    lastModified: new Date().toISOString(),
  }));

  const subjectSitemapIndex = Array.from({ length: totalSubjectSitemaps }, (_, i) => ({
    url: `${baseUrl}/sitemap-subjects/${i + 1}`, // Simplified to /sitemap-subjects/1
    lastModified: new Date().toISOString(),
  }));

  const sitemapEntries = [...staticPages, ...quizSitemapIndex, ...subjectSitemapIndex];
  console.log('[sitemap] Generated entries:', sitemapEntries);
  return sitemapEntries;
}