import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase/client';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const subjectsPerSitemap = 50000; // Maximum allowed by sitemap standards

async function getSubjects(page: number) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('subject')
    .eq('status', 'ready')
    .range(page * subjectsPerSitemap, (page + 1) * subjectsPerSitemap - 1);

  if (error) {
    console.error(`Error fetching subjects for page ${page}:`, error);
    return [];
  }

  // Deduplicate subjects
  const uniqueSubjects = [...new Set(data.map((quiz) => quiz.subject))];
  return uniqueSubjects;
}

interface Params {
  id: string;
}

export default async function Sitemap({ params }: { params: Params }): Promise<MetadataRoute.Sitemap> {
  const page = parseInt(params.id) - 1; // Convert id to zero-based index
  const subjects = await getSubjects(page);

  const subjectRoutes = subjects.map((subject) => ({
    url: `${baseUrl}/quizzes/${subject}`,
    lastmod: new Date().toISOString().split('T')[0],
  }));

  return subjectRoutes;
} 