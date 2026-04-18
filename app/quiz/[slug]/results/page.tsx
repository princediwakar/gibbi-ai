import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuizResults } from "@/components/quiz-results/QuizResults";
import { flattenQuizQuestions } from "@/lib/quiz-utils";
import { Quiz } from "@/types/quiz";

export const metadata = {
  title: "Quiz Results | GibbiAI",
  description: "View your quiz results and performance",
};

export default async function QuizResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  
  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/");
  }
  
  const userId = session.user.id;

  // Await the params before accessing its properties (Next.js 15 async request API)
  const { slug } = await params;
  
  // Extract quiz_id from slug (assuming format: name_id)
  const quizId = slug.split("_").pop();
  
  if (!quizId) {
    redirect("/");
  }
  
  // Fetch quiz base data
  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("quiz_id", quizId)
    .single();

  if (quizError) {
    console.error("[QuizResultsPage] Error fetching quiz:", quizError.message);
  }
  
  if (!quizData) {
    redirect("/");
  }

  // Fetch standalone questions (group_id is null)
  const { data: standaloneQuestions, error: standaloneError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .is("group_id", null);

  if (standaloneError) {
    console.error("[QuizResultsPage] Error fetching standalone questions:", standaloneError.message);
  }

  // Fetch question groups with supporting content and their questions
  const { data: questionGroups, error: groupsError } = await supabase
    .from("question_groups")
    .select("group_id, supporting_content_type, supporting_content, caption, group_order")
    .eq("quiz_id", quizId)
    .order("group_order", { ascending: true });

  if (groupsError) {
    console.error("[QuizResultsPage] Error fetching question groups:", groupsError.message);
  }

  const questionGroupsWithQuestions = questionGroups?.length
    ? await Promise.all(
        questionGroups.map(async (group) => {
          const { data: groupQuestions, error: groupQuestionsError } = await supabase
            .from("questions")
            .select("*")
            .eq("group_id", group.group_id);

          if (groupQuestionsError) {
            console.error(
              `[QuizResultsPage] Error fetching questions for group ${group.group_id}:`,
              groupQuestionsError.message
            );
          }

          return {
            ...group,
            supporting_content: {
              type: group.supporting_content_type,
              content: group.supporting_content,
              caption: group.caption || "",
            },
            questions: groupQuestions || [],
          };
        })
      )
    : [];

  // Assemble quiz object matching Quiz type expected by components
  const quiz: Quiz = {
    ...quizData,
    questions: standaloneQuestions,
    question_groups: questionGroupsWithQuestions,
  };
  
  // Fetch the latest quiz result for this user and quiz
  const { data: result } = await supabase
    .from("quiz_results")
    .select(`
      result_id,
      quiz_id,
      score,
      total_questions,
      answers,
      completed_at,
      time_taken
    `)
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();
  
  if (!result) {
    redirect(`/quiz/${slug}`);
  }
  
  // Convert answers from question_id-based to index-based for QuizResults component
  const flattenedQuestions = flattenQuizQuestions(quiz);
  const indexBasedAnswers: Record<number, string> = {};
  
  // Map from question_id-based answers to index-based answers
  Object.entries(result.answers).forEach(([questionId, answer]) => {
    const index = flattenedQuestions.findIndex(
      (q) => q.question.question_id?.toString() === questionId
    );
    if (index !== -1) {
      indexBasedAnswers[index] = answer as string;
    }
  });
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <QuizResults
          quiz={quiz}
          userAnswers={indexBasedAnswers}
          score={result.score}
          showBackToHistoryLink={true}
        />
      </div>
    </div>
  );
} 