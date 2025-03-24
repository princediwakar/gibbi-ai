// components/QuizList.tsx
"use client";

import { useMemo } from "react";
import { Quiz } from "@/types/quiz";
import { Loader2 } from "lucide-react";
import { QuizCard } from "./quiz-card/QuizCard";

interface QuizListProps {
  quizzes: Quiz[] | null;
  isLoading?: boolean;
  onQuizDeleted?: (quizId: string) => Promise<void>; // Aligned with QuizCardProps
  emptyMessage?: string;
}

export const QuizList = ({
  quizzes,
  isLoading = false,
  onQuizDeleted,
  emptyMessage = "No quizzes available",
}: QuizListProps) => {
  const quizzesBySubject = useMemo(() => {
    if (!quizzes) return null;
    return quizzes.reduce((acc, quiz) => {
      const subject = quiz.subject || "General";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(quiz);
      return acc;
    }, {} as Record<string, Quiz[]>);
  }, [quizzes]);

  if (isLoading) {
    return (
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">Loading quizzes...</p>
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">{emptyMessage}</div>
    );
  }
  
  return (
    <div className="space-y-8">
      {quizzesBySubject && Object.keys(quizzesBySubject).length ? (
        Object.entries(quizzesBySubject).map(([subject, quizzes]) => (
          <div key={subject} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              {subject}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.quiz_id}
                  quiz={quiz}
                  onDelete={onQuizDeleted} // Now matches QuizCardProps
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-6">{emptyMessage}</p>
      )}
    </div>
  );
};