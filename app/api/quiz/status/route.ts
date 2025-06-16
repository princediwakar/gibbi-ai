// app/api/quiz/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const quizId = searchParams.get('id');
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Fetch quiz metadata
    const { data: quizRow, error: quizError } = await supabase
      .from('quizzes')
      .select('quiz_id, title, description, topic, subject, difficulty, language, status')
      .eq('quiz_id', quizId)
      .single();
    if (quizError || !quizRow) {
      console.error('Error fetching quiz status:', quizError);
      return NextResponse.json({ error: quizError?.message || 'Not found' }, { status: 500 });
    }

    const result: Record<string, any> = {
      status: quizRow.status,
    };

    // If ready, attach questions and groups
    if (quizRow.status === 'ready') {
      // Fetch all questions
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('question_id, question_text, options, correct_option, group_id')
        .eq('quiz_id', quizId);
      if (qError) throw qError;

      // Fetch all groups
      const { data: groups, error: gError } = await supabase
        .from('question_groups')
        .select('group_id, supporting_content_type, supporting_content, group_order')
        .eq('quiz_id', quizId)
        .order('group_order', { ascending: true });
      if (gError) throw gError;

      // Assemble grouped questions
      const question_groups = groups.map((g) => {
        const contentRaw = g.supporting_content;
        let content: string | Record<string, any> = contentRaw;
        try { content = JSON.parse(contentRaw as string); } catch {}

        const groupQuestions = (questions || [])
          .filter((q) => q.group_id === g.group_id)
          .map((q) => {
            let opts: any = q.options;
            try { opts = typeof opts === 'string' ? JSON.parse(opts) : opts; } catch {}
            return {
              question_text: q.question_text,
              options: opts,
              correct_option: q.correct_option,
            };
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

      // Standalone questions
      const questionsStandalone = (questions || [])
        .filter((q) => q.group_id === null)
        .map((q) => {
          let opts: any = q.options;
          try { opts = typeof opts === 'string' ? JSON.parse(opts) : opts; } catch {}
          return {
            question_text: q.question_text,
            options: opts,
            correct_option: q.correct_option,
          };
        });

      result.quiz = {
        quiz_id: quizRow.quiz_id,
        title: quizRow.title,
        description: quizRow.description,
        topic: quizRow.topic,
        subject: quizRow.subject,
        difficulty: quizRow.difficulty,
        language: quizRow.language,
        questions: questionsStandalone,
        question_groups,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Status route error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
