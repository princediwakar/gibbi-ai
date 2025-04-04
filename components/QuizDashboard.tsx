// components/QuizDashboard.tsx
"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { QuizCreator } from "./quiz-creator/QuizCreator";
import { QuizList } from "./QuizList";
import { Quiz } from "@/types/quiz";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useUser } from "@/hooks/useUser";
import { handleQuizCreated, handleQuizDeleted } from "./quiz-handlers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import StudentsLanding from "@/app/landing/students/page";

export function QuizDashboard() {
  const { user, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const { quizzes, setQuizzes, isInitialLoading, isLoadingMore, loadMore, hasMore } =
    useQuizzes({ userId: user?.id, searchQuery });

  const observerRef = useRef<HTMLDivElement | null>(null);

  const onQuizCreated = useCallback(
    (quiz: Quiz) => handleQuizCreated(quiz, setQuizzes),
    [setQuizzes]
  );

  const onQuizDeleted = useCallback(
    (deletedQuizId: string): void => {
      return handleQuizDeleted(deletedQuizId, setQuizzes);
    },
    [setQuizzes]
  );

  useEffect(() => {
    if (!hasMore || isLoadingMore || isInitialLoading) return;

    const sentinel = observerRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Bottom of list reached, loading more quizzes");
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [hasMore, isLoadingMore, isInitialLoading, loadMore]);

  return (
    <div className="flex flex-col items-center mx-auto p-6">
      <div className="flex flex-col items-center mb-32 space-y-20">
      <Image src="/Q.svg" alt="GibbiAI logo" height={60} width={60} priority />
      <QuizCreator onQuizCreated={onQuizCreated} />
      </div>
      {isUserLoading || isInitialLoading ? ( // Show loading state only below QuizCreator
        <div className="text-center py-4">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      ) : user ? (
        <div className="space-y-8 w-full"> {/* Add w-full to ensure proper width */}
          <h2 className="text-xl font-bold mb-4">My Quizzes</h2> {/* Remove text-center to avoid centering */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search your quizzes..."
              className="pl-10 max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search quizzes"
            />
          </div>
          <QuizList
            quizzes={quizzes}
            groupBy="date"
            isLoading={isInitialLoading}
            onQuizDeleted={onQuizDeleted}
            emptyMessage={
              searchQuery
                ? "No matching quizzes found."
                : "No quizzes available. Create one to get started!"
            }
          />
          {isLoadingMore && (
            <div className="text-center py-4">
              <span className="text-muted-foreground">Loading more quizzes...</span>
            </div>
          )}
          {!isInitialLoading && hasMore && (
            <div ref={observerRef} className="h-10" />
          )}
          {!isInitialLoading && hasMore && !isLoadingMore && (
            <div className="text-center">
              <Button onClick={loadMore} disabled={isLoadingMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      ) : <StudentsLanding />}
    </div>
  );
}