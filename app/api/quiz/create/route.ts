// api/quiz/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createQuizWithAI } from "@/lib/ai";
import type { GeneratedQuiz } from "@/lib/ai-utils";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  const metrics: Record<string, number> = {};

  try {
    // Parse form data
    const form = await req.formData();
    const content = form.get("content") as string | null;
    const creator_id = form.get("creator_id") as string | null;
    const countRaw = form.get("question_count") as string | null;
    const difficulty = form.get("difficulty") as string | null;
    const language = form.get("language") as string | null;

    // Validate inputs
    if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });
    if (!creator_id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const question_count = countRaw ? parseInt(countRaw, 10) : NaN;
    if (isNaN(question_count) || question_count < 1 || question_count > 50) {
      return NextResponse.json({ error: "question_count must be between 1 and 50" }, { status: 400 });
    }
    if (!difficulty || !["Easy", "Medium", "Hard"].includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty level" }, { status: 400 });
    }
    if (!language) return NextResponse.json({ error: "Language is required" }, { status: 400 });

    // Insert pending quiz row
    const { data: quizRow, error: insertError } = await supabase
      .from("quizzes")
      .insert({
        title: "Generating...",
        description: "Your quiz is being generated",
        status: "pending",
        creator_id,
        topic: "...",
        subject: "...",
        difficulty,
        language,
      })
      .select("quiz_id")
      .single();
    if (insertError || !quizRow) {
      throw new Error(`Failed to create quiz: ${insertError?.message}`);
    }

    // Generate quiz synchronously
    let quizData: GeneratedQuiz;
    try {
      const aiStart = performance.now();
      quizData = await createQuizWithAI(content, question_count, difficulty, language);
      metrics.aiGeneration = performance.now() - aiStart;
    } catch (err) {
      // Mark as failed
      await supabase
        .from("quizzes")
        .update({ status: "failed", error_message: String(err) })
        .eq("quiz_id", quizRow.quiz_id);
      throw err;
    }

    // Update quiz metadata
    const { error: updateError } = await supabase
      .from("quizzes")
      .update({
        title: quizData.title,
        description: quizData.description,
        topic: quizData.topic,
        subject: quizData.subject,
        difficulty: quizData.difficulty,
        status: "ready",
      })
      .eq("quiz_id", quizRow.quiz_id);
    if (updateError) throw new Error(`Quiz update failed: ${updateError.message}`);

    // Insert standalone questions
    if (quizData.questions.length) {
      const { error: qError } = await supabase
        .from("questions")
        .insert(
          quizData.questions.map((q) => ({
            quiz_id: quizRow.quiz_id,
            question_text: q.question_text,
            options: q.options,
            correct_option: q.correct_option,
          }))
        );
      if (qError) throw new Error(`Standalone questions insert failed: ${qError.message}`);
    }

    // Insert question groups and their questions
    for (let idx = 0; idx < (quizData.question_groups || []).length; idx++) {
      const group = quizData.question_groups![idx];
      const { data: grpRow, error: grpError } = await supabase
        .from("question_groups")
        .insert({
          quiz_id: quizRow.quiz_id,
          supporting_content_type: group.supporting_content.type,
          supporting_content:
            typeof group.supporting_content.content === "string"
              ? group.supporting_content.content
              : JSON.stringify(group.supporting_content.content),
          group_order: idx,
        })
        .select("group_id")
        .single();
      if (grpError || !grpRow) throw new Error(`Group insert failed: ${grpError?.message}`);

      if (group.questions.length) {
        const { error: gqError } = await supabase
          .from("questions")
          .insert(
            group.questions.map((q) => ({
              quiz_id: quizRow.quiz_id,
              question_text: q.question_text,
              options: q.options,
              correct_option: q.correct_option,
              group_id: grpRow.group_id,
            }))
          );
        if (gqError) throw new Error(`Group questions insert failed: ${gqError.message}`);
      }
    }

    metrics.totalTime = performance.now() - startTime;
    console.log(
      `Quiz ${quizRow.quiz_id} generated in ${Math.round(metrics.totalTime)}ms`,
      metrics
    );

    return NextResponse.json({ quiz_id: quizRow.quiz_id, status: "ready", metrics });
  } catch (error) {
    console.error("Quiz creation route error:", error);
    metrics.totalTime = performance.now() - startTime;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error", metrics },
      { status: 500 }
    );
  }
}
