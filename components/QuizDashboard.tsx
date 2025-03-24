// components/QuizDashboard.tsx
"use client";

import { useCallback, useState } from "react";
import { QuizCreator } from "./QuizCreator";
import { QuizList } from "./QuizList";
import { Quiz } from "@/types/quiz";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useUser } from "@/hooks/useUser";
import { handleQuizCreated, handleQuizDeleted } from "./quiz-handlers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function QuizDashboard() {
  const user = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const { quizzes, setQuizzes, isInitialLoading, isLoadingMore, loadMore, hasMore } =
    useQuizzes({ userId: user?.id, searchQuery });

  const onQuizCreated = useCallback(
    (quiz: Quiz) => handleQuizCreated(quiz, setQuizzes),
    [setQuizzes]
  );

  const onQuizDeleted = useCallback(
    (deletedQuizId: string): Promise<void> => {
      return Promise.resolve(handleQuizDeleted(deletedQuizId, setQuizzes));
    },
    [setQuizzes]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-24 p-4">
      <QuizCreator onQuizCreated={onQuizCreated} />
      {user && (
        <div className="space-y-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Library</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search your quizzes..."
              className="pl-10 max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <QuizList
            quizzes={quizzes}
            isLoading={isInitialLoading}
            onQuizDeleted={onQuizDeleted}
            emptyMessage={
              searchQuery
                ? "No matching quizzes found."
                : "No quizzes available. Create one to get started!"
            }
          />
          {!isInitialLoading && hasMore && (
            <div className="text-center">
              <Button onClick={loadMore} disabled={isLoadingMore}>
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}