// app/quizzes/[subject]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { QuizList } from "@/components/QuizList";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SubjectQuizzesPage() {
  const { subject } = useParams();
  const decodedSubject = decodeURIComponent(subject as string);
  const [searchQuery, setSearchQuery] = useState("");
  const { quizzes, isInitialLoading, isLoadingMore, loadMore, hasMore } = useQuizzes({
    publicOnly: true,
    searchQuery,
    subjectFilter: decodedSubject, // Filter by subject
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore || isInitialLoading) return;

    const sentinel = observerRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log(`Bottom of ${decodedSubject} quizzes reached, loading more`);
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [hasMore, isLoadingMore, isInitialLoading, loadMore, decodedSubject]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
      <h1 className="text-3xl font-bold mb-4">{decodedSubject} Quizzes</h1>
      <p className="text-muted-foreground">
          Discover quizzes on {decodedSubject} shared by the community.
        </p>
        </div>
        <div className="relative flex gap-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search quizzes..."
          className="pl-10 flex-1 max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search quizzes"
        />
      </div>
      <QuizList
        quizzes={quizzes}
        groupBy="subject"
        isLoading={isInitialLoading}
        emptyMessage={`No quizzes found for ${decodedSubject}.`}
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
  );
}