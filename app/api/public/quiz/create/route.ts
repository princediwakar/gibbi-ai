// api/public/quiz/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { createQuizWithAI } from '@/lib/ai';
import { validateApiKey, checkRateLimit } from '@/lib/api-key-auth';

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

export async function POST(req: NextRequest) {
  console.log('[PublicQuizCreate] Starting public quiz creation...');
  
  try {
    // Check rate limiting first (10 requests per minute per IP)
    const rateLimit = checkRateLimit(req, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded", 
          remaining: rateLimit.remaining,
          resetTime: new Date(rateLimit.resetTime).toISOString()
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      );
    }

    // Validate API key (optional security measure)
    const apiKeyValid = await validateApiKey(req);
    if (!apiKeyValid) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
    }

    // Parse request data
    const body = await req.json();
    const { content, question_count = 10, difficulty = "medium", language = "auto" } = body;
    
    console.log('[PublicQuizCreate] Received params:', { content, question_count, difficulty, language });

    // Validate input
    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    if (typeof content !== 'string' || content.length < 10) {
      return NextResponse.json({ error: "Content must be a string with at least 10 characters" }, { status: 400 });
    }

    if (question_count < 1 || question_count > 50) {
      return NextResponse.json({ error: "Question count must be between 1 and 50" }, { status: 400 });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json({ error: "Difficulty must be 'easy', 'medium', or 'hard'" }, { status: 400 });
    }

    // Create Supabase client (admin access for public API)
    const supabase = await createClient();
    
    // Create quiz record without user authentication
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: 'Generating Quiz...',
        description: 'Quiz is being generated...',
        topic: content.slice(0, 100),
        subject: 'General',
        difficulty,
        language,
        creator_id: null, // No user for public API
        status: 'generating',
        is_public: true // Mark as public quiz
      })
      .select()
      .single();

    if (quizError || !quiz) {
      console.error('[PublicQuizCreate] Failed to create quiz:', quizError);
      return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
    }

    // Start async generation
    generateQuizAsync(quiz.quiz_id, content, question_count, difficulty, language, supabase);

    // Return immediately with quiz ID
    const response = NextResponse.json({ 
      quiz_id: quiz.quiz_id,
      status: 'generating',
      message: 'Quiz generation started. Use the quiz_id to check status.'
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
    
    // Add CORS headers for web usage
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    
    return response;

  } catch (error) {
    console.error('[PublicQuizCreate] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

async function generateQuizAsync(
  quizId: string, 
  content: string, 
  questionCount: number, 
  difficulty: string, 
  language: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  try {
    console.log(`[PublicGenerateQuizAsync] Starting generation for public quiz with content: "${content.slice(0, 50)}..."`);
    
    // Generate quiz with AI (no userId for public API)
    const generatedQuiz = await createQuizWithAI(content, questionCount, difficulty, language, 3);

    console.log(`[PublicGenerateQuizAsync] Generated quiz: "${generatedQuiz.title}" with ${generatedQuiz.questions?.length || 0} standalone + ${generatedQuiz.question_groups?.reduce((sum, g) => sum + g.questions.length, 0) || 0} grouped questions`);

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
    console.error('[PublicGenerateQuizAsync] Error:', error);
    // Update quiz status to failed
    await supabase
      .from('quizzes')
      .update({ status: 'failed' })
      .eq('quiz_id', quizId);
  }
}