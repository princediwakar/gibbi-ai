// app/quiz/[slug]/page.tsx
import { notFound } from "next/navigation";
import { QuizPlayer } from "@/components/quiz-player/QuizPlayer";
import { getQuizWithQuestions, getQuizMetadata } from "@/lib/queries";
import { extractIdFromSlug } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  // searchParams: Promise<{ edit?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const quizId = extractIdFromSlug(slug);
  if (!quizId) {
    return {
      title: "Quiz Not Found",
      description: "Invalid quiz URL",
    };
  }

  try {
    const quiz = await getQuizMetadata(quizId);
    if (!quiz) {
      return {
        title: "Quiz Not Found",
        description: "The requested quiz could not be found",
      };
    }

    const ogImageUrl = `${baseUrl}/api/og?type=quiz&title=${encodeURIComponent(quiz.title)}&topic=${encodeURIComponent(quiz.topic || "General")}`;

    return {
      title: quiz.title,
      description: `${quiz.description}`,
      keywords: [
        quiz.title,
        quiz.topic,
        quiz.subject,
        quiz.difficulty,
        "quiz",
        "test",
        "knowledge",
      ].filter(Boolean) as string[],
      openGraph: {
        title: quiz.title,
        description: `${quiz.description}`,
        url: `${baseUrl}/quiz/${slug}`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${quiz.title} Quiz`,
          },
        ],
      },
      twitter: {
        title: quiz.title,
        description: `${quiz.description}`,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata for quiz:", error);
    return {
      title: "Quiz",
      description: "Take quizzes and test your knowledge",
    };
  }
}

// app/quiz/[slug]/page.tsx
export default async function QuizPage({ params }: PageProps) {
  const supabase = await createClient();
  let user = null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (error.message !== "Auth session missing!") {
        console.error("[QuizPage] Unexpected auth error:", error.message);
      }
    } else {
      user = data.user;
    }
  } catch (e) {
    console.error("[QuizPage] Failed to fetch user session:", e);
  }

  const { slug } = await params;
  const quizId = extractIdFromSlug(slug);
  if (!quizId) notFound();

  const quiz = await getQuizWithQuestions(quizId);
  if (!quiz) notFound();

  const isCreator = user?.id === quiz.creator_id;
  return <QuizPlayer quiz={quiz} isCreator={isCreator} />;
}