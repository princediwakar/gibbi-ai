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

    // Delete the quiz
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('quiz_id', quizId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
  }
}