// components/quiz/QuizCard.tsx
"use client";
import { Quiz } from "@/types/quiz";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { QuizCardInfo } from "./QuizCardInfo";
import { QuizCardActions } from "./QuizCardActions";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  quiz: Quiz;
  onDelete?: (quizId: string) => void; // Made optional
  className?: string;
}

export function QuizCard({ quiz, onDelete, className }: QuizCardProps) {
  const {user} = useUser();
  const isCreator = user?.id === quiz.creator_id;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (isDeleted) return null;

  return (
    <div
      className={cn(
        "border rounded-lg p-6 bg-card text-card-foreground hover:shadow-lg transition-shadow flex flex-col h-full",
        className
      )}
    >
      <div className="flex-1">
        <QuizCardInfo
          title={quiz.title}
          questionCount={quiz.question_count}
          topic={quiz.topic}
          description={quiz.description}
        />
      </div>
      <QuizCardActions
        quiz={quiz}
        isCreator={isCreator}
        user={user}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        setIsDeleted={setIsDeleted}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onDelete={onDelete}
      />
    </div>
  );
}