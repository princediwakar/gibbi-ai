import { createBrowserClient } from '@supabase/ssr';
import type { MetadataRoute } from 'next'


const NEXT_PUBLIC_SUPABASE_URL='https://ppbiycqjoravxsyebmfs.supabase.co'
const NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYml5Y3Fqb3JhdnhzeWVibWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjE4NTgsImV4cCI6MjA1NTM5Nzg1OH0.QMlPxVHQCxvUcbhF37pk7q421cvi1Wdzd00KtNCqR40'

const supabase = createBrowserClient(
  NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
const subjectsPerSitemap = 50000; // Maximum allowed by sitemap standards


console.log('Base URL:', baseUrl);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
    // console.log(`Fetched unique subjects for page ${page}:`, uniqueSubjects); // Debugging
  return uniqueSubjects;
}

interface Params {
  id: string;
}

export default async function Sitemap({ params }: { params: Params }): Promise<MetadataRoute.Sitemap> {
  const page = parseInt(params.id) - 1; // Convert id to zero-based index
  console.log(`Generating sitemap for subject page: ${page + 1}`); // Debugging
  const subjects = await getSubjects(page);

  const subjectRoutes = subjects.map((subject) => ({
    url: `${baseUrl}/quizzes/${subject}`,
    lastmod: new Date().toISOString().split('T')[0],
  }));
    console.log(`Subject routes for page ${page}:`, subjectRoutes); // Debugging

  return subjectRoutes;
}

(async () => {
  const sitemap = await Sitemap({ params: { id: '1' } });
  console.log('Generated sitemap:', sitemap);
})();