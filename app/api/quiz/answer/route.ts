// Path: app/api/quiz/answer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeSkillDomain } from "@/lib/services/skill-normalizer";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { question_id, quiz_id, selected_option, time_taken_ms } = body;

    if (!question_id || !quiz_id || !selected_option) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the question to get correct answer and metadata
    const { data: question, error: qError } = await supabase
      .from("questions")
      .select("question_id, correct_option, explanation, metadata_json")
      .eq("question_id", question_id)
      .single();

    if (qError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const correct = selected_option === question.correct_option;
    const metadata = (question.metadata_json as Record<string, unknown>) ?? {};

    // ETL: Write to question_results for analytics
    const skillDomainRaw = (metadata.skill_domain as string) || "General";
    const skillDomain = normalizeSkillDomain(skillDomainRaw);
    const difficultyTier = (metadata.difficulty_tier as string) || null;
    const misconception = (metadata.misconception as string) || null;
    const timeTakenSeconds = time_taken_ms ? Math.round(time_taken_ms / 1000) : null;

    // Insert analytics row (fire-and-forget — don't block response)
    supabase
      .from("question_results")
      .insert({
        user_id: user.id,
        quiz_id,
        question_id,
        skill_domain: skillDomain,
        difficulty_tier: difficultyTier,
        correct,
        time_taken_seconds: timeTakenSeconds,
        misconception,
      })
      .then(({ error }) => {
        if (error) console.error("[Answer] Failed to insert question_result:", error);
      });

    // Build response
    const distractorAnalysis = metadata.distractor_analysis as Record<string, string> | undefined;

    return NextResponse.json({
      correct,
      explanation: question.explanation ?? "",
      distractor_analysis: distractorAnalysis ?? null,
    });
  } catch (error) {
    console.error("[Answer] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
