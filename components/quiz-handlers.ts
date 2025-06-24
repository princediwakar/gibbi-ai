// components/quiz-handlers.ts
import { Quiz } from "@/types/quiz";

export function handleQuizCreated(quiz: Quiz, setQuizzes: (quizzes: Quiz[]) => void) {
  // Only add the quiz to the list if it has a slug
  if (quiz.slug) {
    setQuizzes((prevQuizzes) => {
      const updatedQuizzes = [quiz, ...prevQuizzes];
      return Array.from(new Map(updatedQuizzes.map((q) => [q.quiz_id, q])).values());
    });
  }
}

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