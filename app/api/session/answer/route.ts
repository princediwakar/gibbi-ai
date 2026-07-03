// Path: app/api/session/answer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SessionAnswerSchema } from "@/lib/validations/tutor";
import { enqueueComeback } from "@/lib/comeback-queue";
import type { SessionQuestion } from "@/types/tutor";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sign in to access your practice sessions." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = SessionAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { session_id, question_id, selected_option, time_to_answer_ms, was_revealed } =
      parsed.data;

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, user_id, exam_profile_id, questions_json, status")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json(
        { error: "Sign in to access your practice sessions." },
        { status: 403 }
      );
    }

    if (session.status !== "active") {
      return NextResponse.json(
        { error: "This session has ended." },
        { status: 400 }
      );
    }

    const questions = session.questions_json as SessionQuestion[];
    const question = questions.find((q) => q.question_id === question_id);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found in this session." },
        { status: 404 }
      );
    }

    const is_correct =
      selected_option !== null
        ? selected_option === question.correct_option
        : false;

    const { data: rpcData, error: rpcError } = await supabase.rpc("submit_answer", {
      p_session_id: session_id,
      p_question_id: question_id,
      p_user_id: user.id,
      p_exam_profile_id: session.exam_profile_id,
      p_skill_domain: question.skill_domain,
      p_selected_option: selected_option,
      p_is_correct: is_correct,
      p_was_revealed: was_revealed,
      p_time_to_answer_ms: time_to_answer_ms,
    });

    if (rpcError) {
      console.error("[SessionAnswer] RPC error:", rpcError);
      return NextResponse.json(
        { error: "Failed to record your answer. Please try again." },
        { status: 500 }
      );
    }

    const rows = rpcData as { inserted: boolean }[] | null;
    const inserted = rows?.[0]?.inserted ?? false;

    // Enqueue incorrect answers into Comeback Queue (Sprint 4)
    if (!is_correct && !was_revealed) {
      enqueueComeback(supabase, {
        userId: user.id,
        examProfileId: session.exam_profile_id,
        skillDomain: question.skill_domain,
        questionId: question_id,
        difficultyTier: String(question.difficulty_tier),
        originalSessionId: session_id,
      }).catch((err) => {
        console.warn("[SessionAnswer] Comeback enqueue failed:", err);
      });
    }

    return NextResponse.json({
      inserted,
      distractor_analysis: question.distractor_analysis,
      explanation: question.explanation,
      correct_option: question.correct_option,
    });
  } catch (error) {
    console.error("[SessionAnswer] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
