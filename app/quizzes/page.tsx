// app/quizzes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { QuizList } from "@/components/QuizList";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function QuizzesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="w-full max-w-6xl py-6 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">From the Community</h1>
        <p className="text-muted-foreground">
          Discover quizzes on all sorts of topics shared by the community.
        </p>
      </div>
      <div className="relative flex gap-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search public quizzes..."
          className="pl-10 flex-1 max-w-md"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search public quizzes"
        />
      </div>
      <QuizList
        publicOnly={true}
        searchQuery={debouncedSearchQuery}
        groupBy="subject"
        emptyMessage={
          debouncedSearchQuery
            ? "No matching quizzes found."
            : "No public quizzes available. Why not create one?"
        }
        showViewMore={true}
      />
    </div>
  );
}