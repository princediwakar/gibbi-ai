import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase/client';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const quizzesPerSitemap = 50000; // Maximum allowed by sitemap standards

console.log('Base URL:', baseUrl);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function getQuizzes(page: number) {
  console.log(`Fetching quizzes for page ${page}...`); // Debugging
  const { data, error } = await supabase
    .from('quizzes')
    .select('slug, updated_at')
    .eq('status', 'ready')
    .range(page * quizzesPerSitemap, (page + 1) * quizzesPerSitemap - 1);

  if (error) {
    console.error(`Error fetching quizzes for page ${page}:`, error);
    return [];
  }

  console.log(`Fetched quizzes for page ${page}:`, data); // Debugging
  return data;
}

interface Params {
  id: string;
}

export default async function Sitemap({ params }: { params: Params }): Promise<MetadataRoute.Sitemap> {
  const page = parseInt(params.id) - 1; // Convert id to zero-based index
  console.log(`Generating sitemap for quiz page: ${page + 1}`); // Debugging

  const quizzes = await getQuizzes(page);

  // Debugging: Log the quizzes fetched
  console.log(`Quizzes for page ${page}:`, quizzes);

  const quizRoutes = quizzes.map((quiz) => ({
    url: `${baseUrl}/quiz/${quiz.slug}`,
    lastmod: quiz.updated_at ? new Date(quiz.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  }));

  console.log(`Quiz routes for page ${page}:`, quizRoutes); // Debugging

  return quizRoutes;
}