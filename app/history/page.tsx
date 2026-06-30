import { QuizHistory } from "@/components/quiz-results/QuizHistory";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "History | GibbiAI",
  description: "Review your past quiz results and track your progress over time",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }
  
  return (
    <div className="w-full max-w-6xl py-6 px-4">
      <QuizHistory />
    </div>
  );
} 