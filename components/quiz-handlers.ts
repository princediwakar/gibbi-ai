// components/quiz-handlers.ts
import { Quiz } from "@/types/quiz";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export async function handleQuizCreated() {
  try {
    // Notify about quiz creation
    toast.success("Quiz created successfully!");
    
    // Trigger a refetch in useQuizzes hook by invalidating the cache
    await supabase.auth.refreshSession();
    
  } catch (error) {
    console.error("Error handling quiz creation:", error);
    toast.error("Failed to update quiz list");
  }
}

export async function handleQuizDeleted() {
  try {
    // Notify about quiz deletion
    toast.success("Quiz deleted successfully!");
    
    // Trigger a refetch in useQuizzes hook by invalidating the cache
    await supabase.auth.refreshSession();
    
  } catch (error) {
    console.error("Error handling quiz deletion:", error);
    toast.error("Failed to update quiz list");
  }
}

export const handleQuizUpdated = (
  updatedQuiz: Quiz,
  setQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>
) => {
  setQuizzes((prev) =>
    prev.map((quiz) => (quiz.quiz_id === updatedQuiz.quiz_id ? updatedQuiz : quiz))
  );
};