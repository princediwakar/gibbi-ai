"use client"
import { useMemo, useState, useEffect, useRef } from "react";
import { Quiz } from "@/types/quiz";
import { Loader2 } from "lucide-react";
import { QuizCard } from "./quiz-card/QuizCard";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
} from 'date-fns';
import Link from "next/link";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";

interface QuizListProps {
  userId?: string;
  publicOnly?: boolean;
  isLoading?: boolean;
  onQuizDeleted?: (quizId: string) => void;
  emptyMessage?: string;
  groupBy?: "subject" | "date";
  showViewMore?: boolean;
  searchQuery?: string;
}

export const QuizList = ({
  userId,
  publicOnly = false,
  onQuizDeleted,
  emptyMessage = "No quizzes available",
  groupBy = "subject",
  showViewMore = false,
  searchQuery = "",
}: QuizListProps) => {
  const { quizzes, isInitialLoading, isLoadingMore, loadMore, hasMore } = useQuizzes({
    userId,
    publicOnly,
    searchQuery,
    limitPerGroup: publicOnly && !searchQuery ? 6 : undefined
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore || isInitialLoading) return;

    const sentinel = observerRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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

  const formatDate = (date: Date | string | undefined): string => {
    // If no date provided, default to "Recently Created" for better UX
    if (!date) return "Recently Created";
    
    const quizDate = new Date(date);
    // If invalid date, also default to "Recently Created"  
    if (isNaN(quizDate.getTime())) return "Recently Created";
    
    if (isToday(quizDate)) return 'Today';
    if (isYesterday(quizDate)) return 'Yesterday';
    if (isThisWeek(quizDate)) return 'This Week';
    if (isThisMonth(quizDate)) return 'This Month';
    if (isThisYear(quizDate)) return format(quizDate, 'LLLL');
    return format(quizDate, 'LLLL yyyy');
  };

  const groupedQuizzes = useMemo(() => {
    if (!quizzes) return null;
    if (groupBy === "date") {
      return quizzes.reduce((acc, quiz) => {
        const dateKey = formatDate(quiz.created_at as string);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(quiz);
        return acc;
      }, {} as Record<string, Quiz[]>);
    } else {
      return quizzes.reduce((acc, quiz) => {
        const subject = quiz.subject || "General";
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(quiz);
        return acc;
      }, {} as Record<string, Quiz[]>);
    }
  }, [quizzes, groupBy]);

  if (isInitialLoading) {
    return (
      <div className="relative min-h-[200px] flex items-center justify-center">
        <div className="absolute inset-0 bg-background/50" />
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm text-muted-foreground ml-2">Loading quizzes...</p>
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">{emptyMessage}</div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {isLoadingMore && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm text-muted-foreground ml-2">Loading more...</p>
        </div>
      )}
      {groupedQuizzes && Object.keys(groupedQuizzes).length ? (
        Object.entries(groupedQuizzes).map(([group, groupQuizzes]) => (
          <div key={group} className="space-y-4">
            <div className="flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold text-muted-foreground pb-2">
                {group}
              </h3>
              {showViewMore && (
                <Link href={`/quizzes/${encodeURIComponent(group)}`} className="text-primary hover:underline">
                  View More
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {groupQuizzes.map((quiz) => (
                <QuizCard key={quiz.quiz_id} quiz={quiz} onDelete={onQuizDeleted} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-6">{emptyMessage}</p>
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
};
