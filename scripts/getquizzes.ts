import { getQuizzes } from '@/app/temp-sitemap-quizzes';

export async function testGetQuizzes() {
  const page = 0; // Test with the first page
  const quizzes = await getQuizzes(page);
  console.log(`Test getQuizzes for page ${page}:`, quizzes);
}

testGetQuizzes();