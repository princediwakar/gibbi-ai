// components/quiz-handlers.ts
import { Quiz } from "@/types/quiz";

export const handleQuizUpdated = (
  updatedQuiz: Quiz,
  setQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>
) => {
  setQuizzes((prev) =>
    prev.map((quiz) => (quiz.quiz_id === updatedQuiz.quiz_id ? updatedQuiz : quiz))
  );
};