import { QuizHistory } from "@/components/quiz-results/QuizHistory";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Quiz History | GibbiAI",
  description: "View your quiz history and track your progress over time",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect("/");
  }
  
  return (
    <div className="w-full max-w-6xl py-6 px-4">
      <QuizHistory />
    </div>
  );
} 