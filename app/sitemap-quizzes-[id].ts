import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase/client';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const quizzesPerSitemap = 50000; // Maximum allowed by sitemap standards

async function getQuizzes(page: number) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('quiz_id, updated_at')
    .eq('status', 'ready')
    .range(page * quizzesPerSitemap, (page + 1) * quizzesPerSitemap - 1);

  if (error) {
    console.error(`Error fetching quizzes for page ${page}:`, error);
    return [];
  }

  return data;
}

interface Params {
  id: string;
}

export default async function Sitemap({ params }: { params: Params }): Promise<MetadataRoute.Sitemap> {
  const page = parseInt(params.id) - 1; // Convert id to zero-based index
  const quizzes = await getQuizzes(page);

  const quizRoutes = quizzes.map((quiz) => ({
    url: `${baseUrl}/quiz/${quiz.quiz_id}`,
    lastmod: quiz.updated_at ? new Date(quiz.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  }));

  return quizRoutes;
}