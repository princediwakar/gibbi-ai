// api/quiz/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { createQuizWithAI } from '@/lib/ai';

export async function POST(req: NextRequest) {
  console.log('[QuizCreate] Starting quiz creation...');
  
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[QuizCreate] Authentication error:', authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log('[QuizCreate] Authenticated user:', user.id);

    // Parse request data
    const formData = await req.formData();
    const content = formData.get("content")?.toString();
    const question_count = parseInt(formData.get("question_count")?.toString() || "10");
    const difficulty = formData.get("difficulty")?.toString() || "medium";
    const language = formData.get("language")?.toString() || "auto";
    
    console.log('[QuizCreate] Received params:', { content, question_count, difficulty, language });

    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    // Create quiz record first with 'generating' status
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: 'Generating Quiz...',
        description: 'Quiz is being generated...',
        topic: content.slice(0, 100), // temporary topic from content
        subject: 'General',
        difficulty,
        language,
        creator_id: user.id,
        status: 'generating'
      })
      .select()
      .single();

    if (quizError || !quiz) {
      console.error('[QuizCreate] Failed to create quiz:', quizError);
      return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
    }

    // Start async generation
    generateQuizAsync(quiz.quiz_id, content, question_count, difficulty, language, supabase);

    // Return immediately with quiz ID
    return NextResponse.json({ 
      quiz_id: quiz.quiz_id,
      status: 'generating'
    });

  } catch (error) {
    console.error('[QuizCreate] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

async function generateQuizAsync(
  quizId: string, 
  content: string, 
  questionCount: number, 
  difficulty: string, 
  language: string,
  supabase: any
) {
  try {
    // Generate quiz with AI
    const generatedQuiz = await createQuizWithAI(content, questionCount, difficulty, language);

    // Update quiz with generated content
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        topic: generatedQuiz.topic,
        subject: generatedQuiz.subject,
        status: 'ready'
      })
      .eq('quiz_id', quizId);

    if (updateError) throw updateError;

    // Insert questions
    if (generatedQuiz.questions?.length) {
      const { error: qError } = await supabase
        .from('questions')
        .insert(
          generatedQuiz.questions.map(q => ({
            quiz_id: quizId,
            question_text: q.question_text,
            options: q.options,
            correct_option: q.correct_option
          }))
        );
      if (qError) throw qError;
    }

    // Insert question groups
    if (generatedQuiz.question_groups?.length) {
      for (const group of generatedQuiz.question_groups) {
        // Insert group
        const { data: groupData, error: gError } = await supabase
          .from('question_groups')
          .insert({
            quiz_id: quizId,
            supporting_content: group.supporting_content.content,
            supporting_content_type: group.supporting_content.type
          })
          .select()
          .single();

        if (gError || !groupData) throw gError;

        // Insert group questions
        const { error: qgError } = await supabase
          .from('questions')
          .insert(
            group.questions.map(q => ({
              quiz_id: quizId,
              group_id: groupData.group_id,
              question_text: q.question_text,
              options: q.options,
              correct_option: q.correct_option
            }))
          );
        if (qgError) throw qgError;
      }
    }

  } catch (error) {
    console.error('[GenerateQuizAsync] Error:', error);
    // Update quiz status to failed
    await supabase
      .from('quizzes')
      .update({ status: 'failed' })
      .eq('quiz_id', quizId);
  }
}
