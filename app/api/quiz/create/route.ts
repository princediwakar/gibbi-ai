import { NextRequest, NextResponse } from "next/server";
import { createQuizWithAI, GeneratedQuiz } from "@/lib/ai";
import { supabase } from "@/lib/supabase/client";
import { setTimeout } from "timers/promises";
// import { Quiz } from "@/types/quiz";

const MAX_PENDING_TIME = Number(process.env.MAX_PENDING_TIME) || 120000; // 120s

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  const metrics: Record<string, number> = {};

  try {
    const parseStart = performance.now();
    const formData = await req.formData();
    const content = formData.get("content") as string;
    const creator_id = formData.get("creator_id") as string;
    const question_count = parseInt(formData.get("question_count") as string, 10);
    const difficulty = formData.get("difficulty") as string;
    const language = formData.get("language") as string;

    metrics.parseRequest = performance.now() - parseStart;

    // Validation
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (!creator_id) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 });
    }
    if (isNaN(question_count) || question_count < 1 || question_count > 50) {
      return NextResponse.json({ error: "Invalid question count (must be 1-50)" }, { status: 400 });
    }
    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty level" }, { status: 400 });
    }
    if (!language) {
      return NextResponse.json({ error: "Language is required" }, { status: 400 });
    }
    metrics.validation = performance.now() - parseStart;

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
        difficulty,
        language,
      })
      .select("quiz_id")
      .single();
    metrics.quizInsert = performance.now() - quizInsertStart;

    if (quizError) throw new Error(`Quiz insert failed: ${quizError.message}`);

    const bgProcessStart = performance.now();
    processQuizInBackground(quiz.quiz_id, content, question_count, difficulty, language);
    metrics.bgProcessStart = performance.now() - bgProcessStart;

    metrics.totalTime = performance.now() - startTime;
    console.log("API Performance Metrics:", metrics);

    return NextResponse.json({
      quiz_id: quiz.quiz_id,
      status: "pending",
      metrics,
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
  content: string,
  questionCount: number,
  difficulty: string,
  language: string
) {
  const startTime = performance.now();
  const metrics: Record<string, number> = {};

  try {
    const aiStart = performance.now();
    const quizData: GeneratedQuiz = await Promise.race([
      createQuizWithAI(content, questionCount, difficulty, language),
      setTimeout(MAX_PENDING_TIME).then(() => {
        throw new Error("Processing timeout");
      }),
    ]);
    metrics.aiGeneration = performance.now() - aiStart;

    console.log("Generated quiz data:", {
      title: quizData.title,
      questionCount: quizData.questions.length,
    });

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

    if (updateError) throw new Error(`Quiz update failed: ${updateError.message}`);

    const questionsPrepStart = performance.now();
    const questionsInsert = quizData.questions.map((q) => ({
      quiz_id: quizId,
      question_text: q.question_text,
      options: q.options,
      correct_option: q.correct_option,
    }));
    metrics.questionsPrep = performance.now() - questionsPrepStart;

    const questionsInsertStart = performance.now();
    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionsInsert);
    metrics.questionsInsert = performance.now() - questionsInsertStart;

    if (questionsError) throw new Error(`Questions insert failed: ${questionsError.message}`);

    metrics.totalTime = performance.now() - startTime;
    console.log(`Quiz processed successfully for content: "${content.slice(0, 60)}..."`, metrics);
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