"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuizResult } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/quiz-utils";
import { Clock, Calendar, Award, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const QuizHistory = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/quiz/results");
        
        if (!response.ok) {
          throw new Error("Failed to fetch quiz history");
        }
        
        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Error fetching quiz history:", err);
        setError("Failed to load your quiz history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizResults();
  }, []);
  
  const handleViewResults = (quizId: string, slug?: string) => {
    if (slug) {
      router.push(`/quiz/${slug}/results`);
    } else {
      // Fallback if slug is not available
      router.push(`/quiz/${quizId}/results`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Quiz History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/20 rounded-lg border border-border">
        <h2 className="text-xl font-medium mb-2">No Quiz History</h2>
        <p className="text-muted-foreground mb-4">
          You haven&apos;t completed any quizzes yet. Take a quiz to see your results here!
        </p>
        <Button onClick={() => router.push("/")}>Find a Quiz</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Quiz History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result, index) => {
          const completedAt = result.completed_at ? new Date(result.completed_at) : null;
          const percentage = result.total_questions > 0 
            ? ((result.score / result.total_questions) * 100).toFixed(1) 
            : "0.0";
          
          // Use result_id as key if available, otherwise use index as fallback
          const uniqueKey = result.result_id || `result-${index}`;
          
          // Determine the slug for the quiz
          const quizSlug = result.quizzes?.slug || `${result.quiz_id}`;
          
          return (
            <Card key={uniqueKey} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">
                  {result.quizzes?.title || "Untitled Quiz"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>
                        Score: {result.score}/{result.total_questions} ({percentage}%)
                      </span>
                    </div>
                    
                    {result.time_taken > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(result.time_taken)}</span>
                      </div>
                    )}
                  </div>
                  
                  {completedAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDistanceToNow(completedAt, { addSuffix: true })}</span>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-2 flex items-center gap-2"
                    onClick={() => handleViewResults(result.quiz_id, quizSlug)}
                  >
                    <Eye className="w-4 h-4" />
                    View Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}; 