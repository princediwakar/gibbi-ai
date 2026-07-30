"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { QuizResult } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/quiz-utils";
import { Clock, Calendar, Award, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuizHistoryProps {
  activeExamName?: string | null;
}

export const QuizHistory = ({ activeExamName }: QuizHistoryProps) => {
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
      router.push(`/quiz/${quizId}/results`);
    }
  };

  const subjects = useMemo(() => {
    const subs = new Set<string>();
    for (const r of results) {
      if (r.quizzes?.subject) {
        subs.add(r.quizzes.subject);
      }
    }
    return Array.from(subs).sort();
  }, [results]);

  const defaultTab = useMemo(() => {
    if (!activeExamName) return "all";
    const lowerExam = activeExamName.toLowerCase();
    const match = subjects.find(s => s.toLowerCase().includes(lowerExam) || lowerExam.includes(s.toLowerCase()));
    return match || "all";
  }, [activeExamName, subjects]);

  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (defaultTab !== "all" && activeTab === "all") {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Quiz History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full mt-2" />
                </div>
              </CardContent>
            </Card>
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

  const filteredResults = activeTab === "all" 
    ? results 
    : results.filter(r => r.quizzes?.subject === activeTab);

  const renderResultCard = (result: QuizResult, index: number) => {
    const completedAt = result.completed_at ? new Date(result.completed_at) : null;
    const percentage = result.total_questions > 0 
      ? ((result.score / result.total_questions) * 100).toFixed(1) 
      : "0.0";
    
    const uniqueKey = result.result_id || `result-${index}`;
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
              
              {typeof result.time_taken === 'number' && result.time_taken > 0 && (
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
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Quiz History</h2>
      
      {subjects.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0">
            <TabsTrigger 
              value="all"
              className="flex-none rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-muted/50"
            >
              All Quizzes
            </TabsTrigger>
            {subjects.map(sub => {
              const isActiveExam = activeExamName && (sub.toLowerCase().includes(activeExamName.toLowerCase()) || activeExamName.toLowerCase().includes(sub.toLowerCase()));
              return (
                <TabsTrigger 
                  key={sub} 
                  value={sub}
                  className="flex-none rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-muted/50"
                >
                  {sub}
                  {isActiveExam && (
                    <span className="ml-2 text-[10px] uppercase bg-background/20 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {filteredResults.length === 0 ? (
              <div className="text-center p-8 bg-muted/20 rounded-lg border border-border mt-4">
                <p className="text-muted-foreground">No quizzes found for this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults.map(renderResultCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map(renderResultCard)}
        </div>
      )}
    </div>
  );
}; 