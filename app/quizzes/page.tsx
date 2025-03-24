// app/quizzes/page.tsx
"use client";

import { useState } from "react";
import { QuizList } from "@/components/QuizList";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { quizzes, isInitialLoading, isLoadingMore, loadMore, hasMore } = useQuizzes({
    publicOnly: true,
    searchQuery,
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Public Library</h2>
      <div className="relative flex gap-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search public quizzes..."
          className="pl-10 flex-1 max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <QuizList
        quizzes={quizzes}
        isLoading={isInitialLoading}
        emptyMessage={
          searchQuery
            ? "No matching quizzes found."
            : "No public quizzes available. Why not create one?"
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
  );
}