import { NextRequest, NextResponse } from "next/server";
import { createQuizWithAI } from "@/lib/ai";
import { supabase } from "@/lib/supabase/client";
import { Quiz } from "@/types/quiz";

const MAX_PENDING_TIME = 300000;
const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_DIFFICULTY = "Hard";

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  const metrics: Record<string, number> = {};

  try {
    const parseStart = performance.now();
    const {
      prompt,
      creator_id,
      question_count,
      difficulty,
      custom_instructions,
    } = await req.json();
    metrics.parseRequest = performance.now() - parseStart;

    // Validation
    const validationStart = performance.now();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    if (!creator_id) {
      return NextResponse.json(
        { error: "User authentication required" },
        { status: 401 }
      );
    }
    metrics.validation = performance.now() - validationStart;

    // Create pending quiz entry
    const quizInsertStart = performance.now();
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        title: "Generating...",
        description: "Your quiz is being generated",
        status: "pending",
        creator_id,
        topic: "Generating...",
        subject: "...Generating...",
        difficulty: difficulty || DEFAULT_DIFFICULTY,
      })
      .select("quiz_id")
      .single();
    metrics.quizInsert = performance.now() - quizInsertStart;

    if (quizError) {
      throw new Error(`Quiz insert failed: ${quizError.message}`);
    }

    // Start background processing
    const bgProcessStart = performance.now();
    processQuizInBackground(
      quiz.quiz_id,
      prompt,
      question_count || DEFAULT_QUESTION_COUNT,
      difficulty || DEFAULT_DIFFICULTY,
      custom_instructions
    );
    metrics.bgProcessStart = performance.now() - bgProcessStart;

    metrics.totalTime = performance.now() - startTime;

    // Log metrics
    console.log("API Performance Metrics:", metrics);

    return NextResponse.json({
      quiz_id: quiz.quiz_id,
      status: "pending",
      metrics, // Include metrics in response for debugging
    });
  } catch (error) {
    console.error("API error:", error);
    metrics.totalTime = performance.now() - startTime;
    console.log("Failed Request Metrics:", metrics);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
        metrics,
      },
      { status: 500 }
    );
  }
}




async function processQuizInBackground(
  quizId: string,
  prompt: string,
  questionCount?: number,
  difficulty?: string,
  customInstructions?: string
) {
  const startTime = performance.now();
  const metrics: Record<string, number> = {};

  try {
    // Generate quiz data using AI with timeout
    const aiStart = performance.now();
    const quizData = await Promise.race<Quiz>([
      createQuizWithAI(prompt, questionCount, difficulty, customInstructions),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Processing timeout")), MAX_PENDING_TIME))
    ]);
    metrics.aiGeneration = performance.now() - aiStart;

    // Update quiz metadata
    const updateStart = performance.now();
    const { error: updateError } = await supabase
      .from("quizzes")
      .update({
        title: quizData.title,
        description: quizData.description,
        subject: quizData.subject,
        topic: quizData.topic,
        difficulty: quizData.difficulty,
        status: "ready",
      })
      .eq("quiz_id", quizId);
    metrics.quizUpdate = performance.now() - updateStart;

    if (updateError) throw updateError;

    // Prepare questions
    const questionsPrepStart = performance.now();
    const questionsInsert = quizData.questions.map((q) => ({
      quiz_id: quizId,
      question_text: q.question_text,
      options: q.options,
      correct_option: q.correct_option,
    }));
    metrics.questionsPrep = performance.now() - questionsPrepStart;

    // Insert questions
    const questionsInsertStart = performance.now();
    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionsInsert);
    metrics.questionsInsert = performance.now() - questionsInsertStart;

    if (questionsError) throw questionsError;

    // Log success metrics
    metrics.totalTime = performance.now() - startTime;
    console.log(`Quiz ${quizId} processed successfully`, metrics);
  } catch (error) {
    const errorStart = performance.now();
    console.error(`Error processing quiz ${quizId}:`, error);

    await supabase
      .from("quizzes")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("quiz_id", quizId);
    metrics.errorHandling = performance.now() - errorStart;
    
    metrics.totalTime = performance.now() - startTime;
    console.log(`Quiz ${quizId} failed`, metrics);
  }
}