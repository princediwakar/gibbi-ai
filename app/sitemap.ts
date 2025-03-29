import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase/client';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const quizzesPerSitemap = 50000; // Maximum allowed by sitemap standards
const subjectsPerSitemap = 50000; // Maximum allowed by sitemap standards

async function getQuizCount() {
  const { error, count } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ready');

  if (error) {
    console.error("Error fetching quiz count:", error);
    return 0;
  }

  return count || 0;
}

async function getSubjectCount() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('subject')
    .eq('status', 'ready');

  if (error) {
    console.error("Error fetching subjects:", error);
    return 0;
  }

  // Deduplicate subjects
  const uniqueSubjects = [...new Set(data.map((quiz) => quiz.subject))];
  return uniqueSubjects.length;
}

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
  const totalQuizzes = await getQuizCount();
  const totalSubjects = await getSubjectCount();
  const totalQuizSitemaps = Math.ceil(totalQuizzes / quizzesPerSitemap);
  const totalSubjectSitemaps = Math.ceil(totalSubjects / subjectsPerSitemap);

  // Static pages
  const staticPages = [
    { url: `${baseUrl}/`, lastmod: new Date().toISOString().split('T')[0] },
    { url: `${baseUrl}/quizzes`, lastmod: new Date().toISOString().split('T')[0] },
    { url: `${baseUrl}/feedback`, lastmod: new Date().toISOString().split('T')[0] },
    { url: `${baseUrl}/privacy`, lastmod: new Date().toISOString().split('T')[0] },
    { url: `${baseUrl}/terms`, lastmod: new Date().toISOString().split('T')[0] },
  ];

  // Sitemap index for quizzes
  const quizSitemapIndex = Array.from({ length: totalQuizSitemaps }, (_, i) => ({
    url: `${baseUrl}/sitemap-quizzes-${i + 1}.xml`,
    lastmod: new Date().toISOString().split('T')[0],
  }));

  // Sitemap index for subjects
  const subjectSitemapIndex = Array.from({ length: totalSubjectSitemaps }, (_, i) => ({
    url: `${baseUrl}/sitemap-subjects-${i + 1}.xml`,
    lastmod: new Date().toISOString().split('T')[0],
  }));

  // Combine static pages, quiz sitemap index, and subject sitemap index
  return [...staticPages, ...quizSitemapIndex, ...subjectSitemapIndex];
}