// hooks/useQuizzes.ts
import { useState, useEffect, useCallback } from "react";
import { Quiz } from "@/types/quiz";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UseQuizzesOptions {
  userId?: string; // Fetch user-specific quizzes if provided
  publicOnly?: boolean; // Fetch only public quizzes if true
  searchQuery?: string; // Filter quizzes by search term
  limitPerGroup?: number; // Limit number of quizzes per group (e.g., subject)
  subjectFilter?: string; // Filter by specific subject
}

export function useQuizzes({
  userId,
  publicOnly = false,
  searchQuery = "",
  limitPerGroup,
  subjectFilter,
}: UseQuizzesOptions = {}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const quizzesPerPage = 15;

  const fetchMoreQuizzes = useCallback(
    async (pageNum: number) => {
      const isFirstFetch = pageNum === 0;
      if (isFirstFetch) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const from = pageNum * quizzesPerPage;
        const to = from + quizzesPerPage - 1;
        let query = supabase.from("quiz_with_counts").select("*").eq("status", "ready");

        if (userId && !publicOnly) {
          query = query.eq("creator_id", userId); // User quizzes
        } else if (publicOnly) {
          query = query.eq("is_public", true).eq("status", "ready"); // Public quizzes
        }

        if (subjectFilter) {
          // query = query.eq("subject", subjectFilter); 
          query = query.or(`subject.eq.${subjectFilter}, topic.eq.${subjectFilter}`)// Filter by subject
        }

        if (searchQuery) {
          query = query.or(
            `title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,topic.ilike.%${searchQuery}%`
          );
        }

        query = query.order("created_at", { ascending: false });

        // If limitPerGroup is set (e.g., for public quizzes page), fetch more to group later
        const rangeTo = limitPerGroup && publicOnly && !subjectFilter ? to + 50 : to; // Fetch extra for grouping
        query = query.range(from, rangeTo);

        const { data, error } = await query;
        if (error) throw error;

        let newQuizzes = data as Quiz[];

        // Apply limitPerGroup for public quizzes without subject filter
        if (limitPerGroup && publicOnly && !subjectFilter) {
          const grouped = newQuizzes.reduce((acc: Record<string, Quiz[]>, quiz: Quiz) => {
            const subject = quiz.subject || "Uncategorized";
            acc[subject] = acc[subject] || [];
            if (acc[subject].length < limitPerGroup) acc[subject].push(quiz);
            return acc;
          }, {});
          newQuizzes = Object.values(grouped).flat();
        }

        setQuizzes((prev) => {
          const updatedQuizzes = [...prev, ...newQuizzes];
          return Array.from(new Map(updatedQuizzes.map((q) => [q.quiz_id, q])).values()); // Deduplicate
        });

        // Estimate hasMore based on fetch size and grouping
        setHasMore(
          data.length === (limitPerGroup && publicOnly && !subjectFilter ? 50 + quizzesPerPage : quizzesPerPage)
        );
      } catch (error: unknown) {
        console.error("Error fetching quizzes:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load quizzes");
      } finally {
        if (isFirstFetch) {
          setIsInitialLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [userId, publicOnly, searchQuery, limitPerGroup, subjectFilter, quizzesPerPage]
  );

  useEffect(() => {
    if (!userId && !publicOnly) {
      setQuizzes([]);
      setIsInitialLoading(false);
      return;
    }
    setQuizzes([]); // Reset quizzes on option change
    setPage(0);
    fetchMoreQuizzes(0);
  }, [userId, publicOnly, searchQuery, subjectFilter, fetchMoreQuizzes]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMoreQuizzes(nextPage);
    }
  }, [hasMore, isLoadingMore, page, fetchMoreQuizzes]);

  return { quizzes, setQuizzes, isInitialLoading, isLoadingMore, loadMore, hasMore };
}