import { notFound } from "next/navigation";
import { QuizPlayer } from "@/components/QuizPlayer";
import { QuizEditor } from "@/components/QuizEditor";
import { getQuizWithQuestions } from "@/lib/queries";
import { extractIdFromSlug } from "@/lib/utils";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { slug } = await params;
  const quizId = extractIdFromSlug(slug);
  if (!quizId) notFound();

  const quiz = await getQuizWithQuestions(quizId);
  if (!quiz) notFound();

  const user = await getCurrentUser();
  const isCreator = user?.id === quiz.creator_id;
  const { edit } = await searchParams;
  const isEditMode = edit === "true" && isCreator;

  if (isEditMode) {
    return <QuizEditor quiz={quiz} />;
  }

  return <QuizPlayer quiz={quiz} />;
}
