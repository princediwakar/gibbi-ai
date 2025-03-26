// app/api/quiz/update/route.ts
import { createClient } from "@/lib/supabase/server";
import { Question } from "@/types/quiz";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { quizId, details, questions, deletedQuestionIds } = await req.json();

  try {
    const invalidQuestions = questions.filter(
      (q: Question) =>
        !q.question_text || !Object.values(q.options).some((opt) => opt) || !q.correct_option
    );
    if (invalidQuestions.length > 0) {
      return NextResponse.json(
        { error: "Questions must have text, options, and a correct answer" },
        { status: 400 }
      );
    }

    // Update quiz details
    const { error: quizError } = await supabase
      .from("quizzes")
      .update(details)
      .eq("quiz_id", quizId);
    if (quizError) throw quizError;

    // Delete removed questions
    if (deletedQuestionIds?.length > 0) {
      const { error: deleteError } = await supabase
        .from("questions")
        .delete()
        .in("question_id", deletedQuestionIds.filter((id: number | undefined) => id !== undefined));
      if (deleteError) throw deleteError;
    }

    // Separate new and existing questions
    const existingQuestions = questions.filter((q: Question) => q.question_id);
    const newQuestions = questions.filter((q: Question) => !q.question_id);

    // Update existing questions
    if (existingQuestions.length > 0) {
      const { error: updateError } = await supabase
        .from("questions")
        .upsert(existingQuestions, { onConflict: "question_id" });
      if (updateError) throw updateError;
    }

    // Insert new questions
    if (newQuestions.length > 0) {
      const { error: insertError } = await supabase
        .from("questions")
        .insert(newQuestions.map((q: Question) => ({ ...q, quiz_id: quizId })));
      if (insertError) throw insertError;
    }

    // Fetch updated quiz to return
    const { data: updatedQuiz, error: fetchError } = await supabase
      .from("quizzes")
      .select("*, questions(*)")
      .eq("quiz_id", quizId)
      .single();
    if (fetchError) throw fetchError;

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}