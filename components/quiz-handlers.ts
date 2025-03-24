// components/quiz-handlers.ts
import { Quiz } from "@/types/quiz";

export const handleQuizCreated = (
  quiz: Quiz,
  setQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>
) => {
  setQuizzes((prev) => {
    if (quiz.status === "failed") {
      return prev.filter((q) => q.quiz_id !== quiz.quiz_id);
    }
    return [quiz, ...prev];
  });
};

export const handleQuizDeleted = (
  deletedQuizId: string,
  setQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>
) => {
  setQuizzes((prev) => prev.filter((quiz) => quiz.quiz_id !== deletedQuizId));
};

export const handleQuizUpdated = (
  updatedQuiz: Quiz,
  setQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>
) => {
  setQuizzes((prev) =>
    prev.map((quiz) => (quiz.quiz_id === updatedQuiz.quiz_id ? updatedQuiz : quiz))
  );
};