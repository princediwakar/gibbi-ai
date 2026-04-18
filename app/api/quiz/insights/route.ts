// app/api/quiz/insights/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get all quiz results with questions (including topics)
    const { data: results, error } = await supabase
      .from("quiz_results")
      .select(`
        result_id,
        quiz_id,
        score,
        total_questions,
        answers,
        completed_at,
        quizzes(
          title,
          subject,
          topic,
          questions(question_id, question_text, correct_option, topics, explanation)
        )
      `)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });
    
    if (error) throw error;
    
    // Aggregate weak topics
    const topicStats: Record<string, { total: number; correct: number; questions: Array<{ text: string; explanation: string }> }> = {};
    
    for (const result of results || []) {
      const quiz = result.quizzes as unknown as {
        questions: Array<{
          question_id: number;
          question_text: string;
          correct_option: string;
          topics: string[] | null;
          explanation: string | null;
        }>;
      };
      
      if (!quiz?.questions) continue;
      
      const userAnswers = result.answers as Record<string, string>;
      
      for (const question of quiz.questions) {
        const userAnswer = userAnswers[question.question_id];
        const isCorrect = userAnswer === question.correct_option;
        const topics = question.topics || [];
        
        for (const topic of topics) {
          if (!topicStats[topic]) {
            topicStats[topic] = { total: 0, correct: 0, questions: [] };
          }
          
          topicStats[topic].total++;
          if (isCorrect) {
            topicStats[topic].correct++;
          } else {
            topicStats[topic].questions.push({
              text: question.question_text,
              explanation: question.explanation || ""
            });
          }
        }
      }
    }
    
    // Calculate mastery percentage and sort by weakest first
    const weakTopics = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        total: stats.total,
        correct: stats.correct,
        mastery: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        questionsMissed: stats.questions.slice(0, 3) // Limit to 3 examples
      }))
      .filter(t => t.total >= 2) // Only include topics with at least 2 questions attempted
      .sort((a, b) => a.mastery - b.mastery); // Weakest first
    
    // Get strong topics too
    const strongTopics = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        total: stats.total,
        correct: stats.correct,
        mastery: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
      }))
      .filter(t => t.total >= 2 && t.mastery >= 80)
      .sort((a, b) => b.mastery - a.mastery);
    
    // Get unique subjects user has attempted
    const subjects = new Set<string>();
    for (const result of results || []) {
      const quiz = result.quizzes as unknown as { subject?: string };
      if (quiz?.subject) subjects.add(quiz.subject);
    }
    
    return NextResponse.json({
      weakTopics: weakTopics.slice(0, 10),
      strongTopics: strongTopics.slice(0, 5),
      totalQuizzesTaken: results?.length || 0,
      subjectsAttempted: Array.from(subjects)
    });
    
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}