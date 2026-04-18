"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Loader2, TrendingUp, Target, Zap, ArrowRight } from "lucide-react";

interface TopicInsight {
  topic: string;
  total: number;
  correct: number;
  mastery: number;
  questionsMissed?: Array<{ text: string; explanation: string }>;
}

interface InsightsData {
  weakTopics: TopicInsight[];
  strongTopics: TopicInsight[];
  totalQuizzesTaken: number;
  subjectsAttempted: string[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/quiz/insights");
        
        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }
        
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError("Failed to load analytics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive text-center">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4 mx-auto block">
          Try Again
        </Button>
      </Card>
    );
  }

  if (!data || (data.totalQuizzesTaken === 0)) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No Analytics Yet</h3>
            <p className="text-muted-foreground mt-1">
              Complete some quizzes to see your performance insights here.
            </p>
          </div>
          <Button onClick={() => router.push("/")}>
            Take a Quiz
          </Button>
        </div>
      </Card>
    );
  }

  const chartData = [
    ...data.weakTopics.slice(0, 5).map(t => ({ 
      name: t.topic.length > 20 ? t.topic.slice(0, 20) + "..." : t.topic, 
      mastery: t.mastery, 
      type: "weak",
      fullTopic: t.topic 
    })),
    ...data.strongTopics.slice(0, 5).map(t => ({ 
      name: t.topic.length > 20 ? t.topic.slice(0, 20) + "..." : t.topic, 
      mastery: t.mastery, 
      type: "strong",
      fullTopic: t.topic 
    })),
  ];

  const handleGenerateQuiz = (topic: string) => {
    router.push(`/?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                <p className="text-2xl font-bold">{data.totalQuizzesTaken}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subjects Explored</p>
                <p className="text-2xl font-bold">{data.subjectsAttempted.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Strong Topics</p>
                <p className="text-2xl font-bold">{data.strongTopics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Performance Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topic Performance</CardTitle>
            <CardDescription>
              Your mastery level across different topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Mastery"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="mastery" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.type === "strong" ? "#22c55e" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Areas to Improve */}
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Areas to Improve</CardTitle>
            <CardDescription>
              Topics where your mastery is below 80%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.weakTopics.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Great job! No weak areas identified yet.
              </p>
            ) : (
              data.weakTopics.slice(0, 5).map((topic) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between p-3 rounded-lg border bg-destructive/5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{topic.topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all"
                          style={{ width: `${topic.mastery}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {topic.mastery}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {topic.correct}/{topic.total} correct
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-3 shrink-0"
                    onClick={() => handleGenerateQuiz(topic.topic)}
                  >
                    Practice
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Strong Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-500">Strong Topics</CardTitle>
            <CardDescription>
              Topics where your mastery is 80% or higher
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.strongTopics.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Keep completing quizzes to identify your strengths!
              </p>
            ) : (
              data.strongTopics.slice(0, 5).map((topic) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between p-3 rounded-lg border bg-green-500/5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{topic.topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 rounded-full transition-all"
                          style={{ width: `${topic.mastery}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {topic.mastery}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {topic.correct}/{topic.total} correct
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-3 shrink-0"
                    onClick={() => handleGenerateQuiz(topic.topic)}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}