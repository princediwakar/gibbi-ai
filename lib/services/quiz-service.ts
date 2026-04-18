import { createClient as createServerClient } from '@/lib/supabase/server';
import { createQuizWithAI } from '@/lib/ai';
import { Question } from '@/types/quiz';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface QuizGenerationParams {
  content: string;
  questionCount: number;
  difficulty: string;
  language: string;
}

export interface QuizWithId {
  quiz_id: string;
  title: string;
  description: string;
  topic: string;
  subject: string;
  difficulty: string;
  language: string;
  creator_id: string | null;
  status: string;
  is_public?: boolean;
}

async function insertQuestions(
  supabase: SupabaseClient,
  quizId: string,
  questions: Question[],
  groupId?: number
): Promise<void> {
  if (!questions.length) return;

  const { error } = await supabase.from('questions').insert(
    questions.map(q => ({
      quiz_id: quizId,
      group_id: groupId ?? null,
      question_text: q.question_text,
      options: q.options,
      correct_option: q.correct_option,
      topics: q.topics ?? [],
      explanation: q.explanation ?? ''
    }))
  );

  if (error) throw error;
}

async function insertQuestionGroup(
  supabase: SupabaseClient,
  quizId: string,
  group: { supporting_content: { type: string; content: unknown; caption?: string }; questions: Question[] }
): Promise<void> {
  const { data: groupData, error: gError } = await supabase
    .from('question_groups')
    .insert({
      quiz_id: quizId,
      supporting_content: group.supporting_content.content,
      supporting_content_type: group.supporting_content.type,
      caption: group.supporting_content.caption ?? ''
    })
    .select()
    .single();

  if (gError || !groupData) throw gError;

  await insertQuestions(supabase, quizId, group.questions, groupData.group_id);
}

export async function generateQuizAsync(
  quizId: string,
  params: QuizGenerationParams,
  userId: string | null,
  supabase: SupabaseClient
): Promise<void> {
  console.log(`[QuizService] generateQuizAsync started for ${quizId}`);

  try {
    console.log(`[QuizService] Calling AI to generate quiz ${quizId}`);
    
    const generatedQuiz = await createQuizWithAI(
      params.content,
      params.questionCount,
      params.difficulty,
      params.language,
      3,
      userId ?? undefined
    );

    console.log('[QuizService] AI returned, quiz title:', generatedQuiz.title);

    const standaloneCount = generatedQuiz.questions?.length ?? 0;
    const groupedCount = generatedQuiz.question_groups?.reduce((sum, g) => sum + g.questions.length, 0) ?? 0;
    console.log(`[QuizService] Generated: ${standaloneCount} standalone + ${groupedCount} grouped questions`);

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

    if (generatedQuiz.questions?.length) {
      await insertQuestions(supabase, quizId, generatedQuiz.questions);
    }

    if (generatedQuiz.question_groups?.length) {
      for (const group of generatedQuiz.question_groups) {
        await insertQuestionGroup(supabase, quizId, group);
      }
    }

    console.log(`[QuizService] Quiz ${quizId} completed successfully`);
  } catch (error) {
    console.error('[QuizService] Error:', error);

    await supabase
      .from('quizzes')
      .update({ status: 'failed' })
      .eq('quiz_id', quizId);

    throw error;
  }
}

export async function createQuizRecord(
  params: QuizGenerationParams & { creatorId: string | null; isPublic?: boolean }
): Promise<QuizWithId> {
  const supabase = await createServerClient();

  console.log('[QuizService] Creating quiz record with params:', {
    topic: params.content.slice(0, 50),
    questionCount: params.questionCount,
    difficulty: params.difficulty,
    language: params.language,
    creatorId: params.creatorId,
    isPublic: params.isPublic
  });

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .insert({
      title: 'Generating Quiz...',
      description: 'Quiz is being generated...',
      topic: params.content.slice(0, 100),
      subject: 'General',
      difficulty: params.difficulty,
      language: params.language,
      creator_id: params.creatorId,
      status: 'generating',
      is_public: params.isPublic ?? false
    })
    .select()
    .single();

  if (error) {
    console.error('[QuizService] Insert error:', error);
    throw new Error(`Failed to create quiz: ${error.message}`);
  }
  if (!quiz) {
    console.error('[QuizService] No data returned from insert');
    throw new Error('Failed to create quiz: no data returned');
  }

  console.log('[QuizService] Quiz created with ID:', quiz.quiz_id, 'status:', quiz.status);
  return quiz;
}