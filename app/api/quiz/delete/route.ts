import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { quizId, userId } = await request.json();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: quiz, error: fetchError } = await supabase
      .from('quizzes')
      .select('creator_id')
      .eq('quiz_id', quizId)
      .single();
    if (fetchError || !quiz || quiz.creator_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete related records in the correct order to avoid foreign key constraint violations
    
    // 1. Delete quiz results first (they reference the quiz)
    const { error: resultsDeleteError } = await supabase
      .from('quiz_results')
      .delete()
      .eq('quiz_id', quizId);
    if (resultsDeleteError) {
      console.error('Error deleting quiz results:', resultsDeleteError);
      throw resultsDeleteError;
    }

    // 2. Delete questions (they reference the quiz and question groups)
    const { error: questionsDeleteError } = await supabase
      .from('questions')
      .delete()
      .eq('quiz_id', quizId);
    if (questionsDeleteError) {
      console.error('Error deleting questions:', questionsDeleteError);
      throw questionsDeleteError;
    }

    // 3. Delete question groups (they reference the quiz)
    const { error: groupsDeleteError } = await supabase
      .from('question_groups')
      .delete()
      .eq('quiz_id', quizId);
    if (groupsDeleteError) {
      console.error('Error deleting question groups:', groupsDeleteError);
      throw groupsDeleteError;
    }

    // 4. Finally delete the quiz itself
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('quiz_id', quizId);
    if (deleteError) {
      console.error('Error deleting quiz:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
  }
}