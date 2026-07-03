// Path: app/api/quiz/create/route.ts
import { NextRequest } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { createQuizChunked } from '@/lib/ai';
import { insertQuestions, insertQuestionGroup } from '@/lib/services/quiz-service';
import { checkGenerationLimit, recordGeneration } from '@/lib/services/usage-service';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function streamSSE(controller: ReadableStreamDefaultController, data: Record<string, unknown>) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

export async function POST(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const keepAlive = setInterval(() => {
        if (!closed) {
          try {
            controller.enqueue(new TextEncoder().encode(`data: {"type":"keepalive"}\n\n`));
          } catch {}
        }
      }, 5000);

      function safeClose() {
        if (closed) return;
        closed = true;
        clearInterval(keepAlive);
        try { controller.close(); } catch { /* controller may already be closed by the runtime */ }
      }

      function safeStreamSSE(data: Record<string, unknown>) {
        if (closed) return;
        try { streamSSE(controller, data); } catch { closed = true; }
      }

      try {
        // Auth via Bearer token
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) {
          safeStreamSSE({ type: "error", message: "Sign in to generate quizzes." });
          safeClose();
          return;
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
          safeStreamSSE({ type: "error", message: "Sign in to generate quizzes." });
          safeClose();
          return;
        }

        // First-byte ping before any work
        safeStreamSSE({ type: "connected" });

        // Parse JSON body
        let body: { content?: string; question_count?: number; difficulty?: string; language?: string; focus_topics?: string[] };
        try {
          body = await req.json();
        } catch {
          safeStreamSSE({ type: "error", message: "Invalid request body." });
          safeClose();
          return;
        }

        const content = body.content;
        const questionCount = body.question_count || 10;
        const difficulty = body.difficulty || "Medium";
        const language = body.language || "Auto";
        const focusTopics = body.focus_topics;

        if (!content) {
          safeStreamSSE({ type: "error", message: "No content provided." });
          safeClose();
          return;
        }

        // Rate limit check
        const { allowed, used, limit } = await checkGenerationLimit(user.id);
        if (!allowed) {
          safeStreamSSE({
            type: "error",
            message: `Daily limit reached (${used}/${limit}). Try again tomorrow.`,
          });
          safeClose();
          return;
        }

        // Create quiz record in DB
        const { data: quiz, error: createError } = await supabase
          .from('quizzes')
          .insert({
            title: 'Generating Quiz...',
            description: 'Quiz is being generated...',
            topic: content.slice(0, 100),
            subject: 'General',
            difficulty,
            language,
            creator_id: user.id,
            status: 'generating',
            is_public: false,
          })
          .select()
          .single();

        if (createError || !quiz) {
          safeStreamSSE({ type: "error", message: "Failed to create quiz record." });
          safeClose();
          return;
        }

        const quizId = quiz.quiz_id;
        safeStreamSSE({ type: "progress", done: 0, total: questionCount });

        // Run chunked generation with progress callbacks
        const result = await createQuizChunked(
          content, questionCount, difficulty, language, user.id,
          (progress) => {
            if (!req.signal.aborted) {
              safeStreamSSE({ type: "progress", done: progress.done, total: progress.total });
            }
          },
          req.signal,
          focusTopics
        );

        const clientDropped = req.signal.aborted || closed;

        // Total failure — only mark failed if nothing was generated
        if (!result.quiz && result.totalGenerated === 0) {
          await supabase.from('quizzes').update({ status: 'failed' }).eq('quiz_id', quizId);
          if (!clientDropped) {
            safeStreamSSE({ type: "error", message: "Quiz generation failed. Please try again." });
          }
          safeClose();
          return;
        }

        const quizData = result.quiz!;

        // Always persist successful results, even if client disconnected
        await supabase
          .from('quizzes')
          .update({
            title: quizData.title,
            description: quizData.description,
            topic: quizData.topic,
            subject: quizData.subject,
            status: 'ready',
          })
          .eq('quiz_id', quizId);

        if (quizData.questions?.length) {
          await insertQuestions(supabase, quizId, quizData.questions);
        }

        if (quizData.question_groups?.length) {
          for (const group of quizData.question_groups) {
            await insertQuestionGroup(supabase, quizId, group);
          }
        }

        // Record usage only after successful generation
        recordGeneration(user.id, quizId, questionCount, questionCount * 250);

        if (clientDropped) {
          safeClose();
          return;
        }

        // Emit result event to connected client
        if (result.partial) {
          safeStreamSSE({
            type: "partial",
            quiz_id: quizId,
            generated: result.totalGenerated,
            requested: result.totalRequested,
          });
        } else {
          const { data: fullQuiz } = await supabase
            .from('quizzes')
            .select('quiz_id, title, description, topic, subject, difficulty, language, slug, status')
            .eq('quiz_id', quizId)
            .single();

          safeStreamSSE({
            type: "complete",
            quiz_id: quizId,
            quiz: fullQuiz,
          });
        }
        safeClose();
      } catch (error) {
        console.error('[QuizCreate] Error:', error);
        safeStreamSSE({ type: "error", message: (error as Error).message || "Internal server error." });
        safeClose();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
