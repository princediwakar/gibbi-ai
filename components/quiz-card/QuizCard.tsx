// components/quiz/QuizCard.tsx
"use client";
import { Quiz } from "@/types/quiz";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { QuizCardInfo } from "./QuizCardInfo";
import { QuizCardActions } from "./QuizCardActions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface QuizCardProps {
  quiz: Quiz;
  onDelete?: (quizId: string) => void; // Made optional
  className?: string;
}

export function QuizCard({ quiz, onDelete, className }: QuizCardProps) {
  const router = useRouter();
  const {user} = useUser();
  const isCreator = user?.id === quiz.creator_id;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons or dropdown menu
    const target = e.target as HTMLElement;
    if (
      target.closest('.quiz-card-actions') || 
      target.closest('[role="menu"]') ||
      target.closest('[role="menuitem"]') ||
      target.closest('button[role="combobox"]') ||
      isDeleting // Prevent navigation while deleting
    ) {
      e.stopPropagation();
      return;
    }
    // Only navigate if slug is available
    if (quiz.slug) {
      router.push(`/quiz/${quiz.slug}`);
    }
  };

  if (isDeleted) return null;

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 p-[1px] transition-shadow hover:shadow-2xl",
        isDeleting ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className
      )}
    >
      <div className="bg-card rounded-[inherit] p-6 flex flex-col h-full text-card-foreground">
        <div className="flex-1">
          <QuizCardInfo
            title={quiz.title}
            questionCount={quiz.question_count ?? undefined}
            topic={quiz.topic ?? undefined}
            description={quiz.description ?? undefined}
          />
        </div>
        <div className="quiz-card-actions">
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
      </div>
    </div>
  );
}