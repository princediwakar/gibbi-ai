// api/public/quiz/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { createQuizRecord, generateQuizAsync } from '@/lib/services/quiz-service';
import { validateApiKey, checkRateLimit } from '@/lib/api-key-auth';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: NextRequest) {
  console.log('[PublicQuizCreate] Starting public quiz creation...');
  
  try {
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

    const apiKeyValid = await validateApiKey(req);
    if (!apiKeyValid) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
    }

    const body = await req.json();
    const { content, question_count = 10, difficulty = "medium", language = "auto" } = body;
    
    console.log('[PublicQuizCreate] Received params:', { content, question_count, difficulty, language });

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

    const supabase = await createClient();

    const quiz = await createQuizRecord({
      content,
      questionCount: question_count,
      difficulty,
      language,
      creatorId: null,
      isPublic: true
    });

    generateQuizAsync(quiz.quiz_id, { content, questionCount: question_count, difficulty, language }, null, supabase).catch(err => {
      console.error('[PublicQuizCreate] Async generation failed:', err);
    });

    const response = NextResponse.json({ 
      quiz_id: quiz.quiz_id,
      status: 'generating',
      message: 'Quiz generation started. Use the quiz_id to check status.'
    });

    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    
    return response;

  } catch (error) {
    console.error('[PublicQuizCreate] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}