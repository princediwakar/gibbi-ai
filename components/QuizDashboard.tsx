// components/QuizDashboard.tsx
"use client";

import { useCallback, useState, useEffect } from "react";
import { QuizCreator } from "./quiz-creator/QuizCreator";
import { QuizList } from "./QuizList";
import { Quiz } from "@/types/quiz";
import { useUser } from "@/hooks/useUser";
import { handleQuizCreated } from "./quiz-handlers";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import Image from "next/image";
import StudentsLanding from "@/app/landing/students/page";

export function QuizDashboard() {
  const { user, isUserLoading } = useUser();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  const onQuizCreated = useCallback((quiz: Quiz) => {
    handleQuizCreated(quiz);
  }, []);

  return (
    <div className="flex flex-col items-center mx-auto p-6">
      <div className="flex flex-col items-center mb-32 space-y-20">
        <Image src="/Q.svg" alt="GibbiAI logo" height={60} width={60} priority />
        <QuizCreator onQuizCreated={onQuizCreated} />
      </div>
      
      {isUserLoading ? (
        <div className="w-full max-w-7xl min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : !user ? (
        <StudentsLanding />
      ) : (
        <div className="w-full max-w-7xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">My Quizzes</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search your quizzes..."
                className="pl-10 max-w-md"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
          
          <div className="quiz-list-container min-h-[400px]">
            <QuizList
              userId={user.id}
              groupBy={searchInput ? "subject" : "date"}
              searchQuery={debouncedSearchQuery}
              emptyMessage={
                searchInput
                  ? "No matching quizzes found."
                  : "No quizzes available. Create one to get started!"
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}