// app/edit/[slug]/page.tsx
import { notFound } from "next/navigation";
import { QuizPlayer } from "@/components/quiz-player/QuizPlayer";
import { QuizEditor } from "@/components/quiz-editor/QuizEditor";
import { getQuizWithQuestions, getQuizMetadata } from "@/lib/queries";
import { extractIdFromSlug } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const quizId = extractIdFromSlug(slug);
  if (!quizId) {
    return { title: "Quiz Not Found", description: "Invalid quiz URL" };
  }

  try {
    const quiz = await getQuizMetadata(quizId);
    if (!quiz) {
      return { title: "Quiz Not Found", description: "The requested quiz could not be found" };
    }

    const ogImageUrl = `${baseUrl}/api/og?type=quiz&title=${encodeURIComponent(quiz.title)}&topic=${encodeURIComponent(quiz.topic || "General")}`;

    return {
      title: quiz.title,
      description: `Take the ${quiz.title} quiz on ${quiz.topic || "various topics"}. Created by ${quiz.creator_name || "Unknown"}. ${quiz.description || "Test your knowledge now!"}`,
      keywords: [quiz.title, quiz.topic, quiz.subject, quiz.difficulty, "quiz", "test", "knowledge"].filter(Boolean) as string[],
      openGraph: {
        title: quiz.title,
        description: `Take the ${quiz.title} quiz on ${quiz.topic || "various topics"}. Created by ${quiz.creator_name || "Unknown"}.`,
        url: `${baseUrl}/quiz/${slug}`,
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${quiz.title} Quiz` }],
      },
      twitter: {
        title: quiz.title,
        description: `Take the ${quiz.title} quiz on ${quiz.topic || "various topics"}. Created by ${quiz.creator_name || "Unknown"}.`,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata for quiz:", error);
    return { title: "Quiz", description: "Take quizzes and test your knowledge" };
  }
}

export default async function QuizEditPage({ params }: PageProps) {
  const supabase = await createClient();
  let user = null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error && error.message !== "Auth session missing!") {
      console.error("Unexpected auth error:", error.message);
    } else if (data) {
      user = data.user;
    }
  } catch (e) {
    console.error("Failed to fetch user session:", e);
  }

  const { slug } = await params;
  const quizId = extractIdFromSlug(slug);
  if (!quizId) notFound();

  const quiz = await getQuizWithQuestions(quizId);
  if (!quiz) notFound();

  const isCreator = user?.id === quiz.creator_id;

  return isCreator ? (
    <QuizEditor quiz={quiz}  />
  ) : (
    <QuizPlayer quiz={quiz} isCreator={isCreator} />
  );
}