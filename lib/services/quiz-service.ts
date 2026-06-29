import { Question } from '@/types/quiz';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function insertQuestions(
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
      explanation: q.explanation ?? '',
      metadata_json: {
        difficulty_tier: q.difficulty_tier ?? null,
        distractor_analysis: q.distractor_analysis ?? null,
        skill_domain: q.skill_domain ?? null,
        time_estimate_seconds: q.time_estimate_seconds ?? null,
        misconception: q.misconception ?? null,
      },
    }))
  );

  if (error) throw error;
}

export async function insertQuestionGroup(
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