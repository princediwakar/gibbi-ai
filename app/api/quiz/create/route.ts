// api/quiz/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { createQuizRecord, generateQuizAsync } from '@/lib/services/quiz-service';

export async function POST(req: NextRequest) {
  console.log('[QuizCreate] Starting quiz creation...');
  
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[QuizCreate] Authentication error:', authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log('[QuizCreate] Authenticated user:', user.id);

    const formData = await req.formData();
    const content = formData.get("content")?.toString();
    const question_count = parseInt(formData.get("question_count")?.toString() || "10");
    const difficulty = formData.get("difficulty")?.toString() || "medium";
    const language = formData.get("language")?.toString() || "auto";
    
    console.log('[QuizCreate] Received params:', { content, question_count, difficulty, language });

    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const quiz = await createQuizRecord({
      content,
      questionCount: question_count,
      difficulty,
      language,
      creatorId: user.id,
      isPublic: false
    });

    console.log('[QuizCreate] Quiz created, starting async generation:', quiz.quiz_id);
    generateQuizAsync(quiz.quiz_id, { content, questionCount: question_count, difficulty, language }, user.id, supabase).catch(err => {
      console.error('[QuizCreate] Async generation failed:', err);
    });

    return NextResponse.json({ 
      quiz_id: quiz.quiz_id,
      status: 'generating'
    });

  } catch (error) {
    console.error('[QuizCreate] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}