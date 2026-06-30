// Path: app/api/quiz/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const quizId = searchParams.get("id");
    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: quizRow, error: quizError } = await supabase
      .from("quizzes")
      .select("quiz_id, title, description, topic, subject, difficulty, language, status, slug, creator_id")
      .eq("quiz_id", quizId)
      .maybeSingle();
    if (quizError || !quizRow) {
      return NextResponse.json({ error: quizError?.message || "Quiz not found" }, { status: 404 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isOwner = user?.id === quizRow.creator_id;

    const result: Record<string, unknown> = {
      status: quizRow.status,
    };

    if (quizRow.status === "ready") {
      const { data: questions, error: qError } = await supabase
        .from("questions")
        .select("question_id, question_text, options, correct_option, group_id")
        .eq("quiz_id", quizId);
      if (qError) throw qError;

      const { data: groups, error: gError } = await supabase
        .from("question_groups")
        .select("group_id, supporting_content_type, supporting_content, group_order")
        .eq("quiz_id", quizId)
        .order("group_order", { ascending: true });
      if (gError) throw gError;

      const stripAnswers = (q: { question_text: string; options: unknown; correct_option?: string }) => {
        const cleaned: Record<string, unknown> = {
          question_text: q.question_text,
          options: q.options,
        };
        if (isOwner) cleaned.correct_option = q.correct_option;
        return cleaned;
      };

      const question_groups = groups.map((g) => {
        const contentRaw = g.supporting_content;
        let content: string | Record<string, unknown> = contentRaw;
        try { content = JSON.parse(contentRaw as string); } catch {}

        const groupQuestions = (questions || [])
          .filter((q) => q.group_id === g.group_id)
          .map((q) => {
            let opts: Record<string, string> | string = q.options;
            try { opts = typeof opts === "string" ? JSON.parse(opts) : opts; } catch {}
            return stripAnswers({ question_text: q.question_text, options: opts, correct_option: q.correct_option });
          });

        return {
          group_id: g.group_id,
          supporting_content: {
            type: g.supporting_content_type,
            content,
          },
          questions: groupQuestions,
        };
      });

      const questionsStandalone = (questions || [])
        .filter((q) => q.group_id === null)
        .map((q) => {
          let opts: Record<string, string> | string = q.options;
          try { opts = typeof opts === "string" ? JSON.parse(opts) : opts; } catch {}
          return stripAnswers({ question_text: q.question_text, options: opts, correct_option: q.correct_option });
        });

      result.quiz = {
        quiz_id: quizRow.quiz_id,
        title: quizRow.title,
        description: quizRow.description,
        topic: quizRow.topic,
        subject: quizRow.subject,
        difficulty: quizRow.difficulty,
        language: quizRow.language,
        slug: quizRow.slug,
        questions: questionsStandalone,
        question_groups,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Status route error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
