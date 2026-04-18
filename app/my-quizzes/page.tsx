import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { QuizList } from "@/components/QuizList";

export const metadata: Metadata = {
  title: "My Quizzes | GibbiAI",
  description: "View and manage your created quizzes",
};

export default async function MyQuizzesPage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/");
  }
  
  return (
    <div className="w-full max-w-6xl py-6 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Quizzes</h2>
      </div>
      
      <div className="quiz-list-container min-h-[400px]">
        <QuizList
          userId={session.user.id}
          groupBy="date"
          searchQuery=""
          emptyMessage="No quizzes available. Create one to get started!"
        />
      </div>
    </div>
  );
}