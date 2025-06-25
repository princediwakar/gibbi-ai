import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { QuizResult } from "@/types/quiz";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    const { 
      quiz_id, 
      score, 
      total_questions, 
      answers, 
      time_taken 
    } = body as QuizResult;
    
    if (!quiz_id || score === undefined || !total_questions || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Upsert the quiz result (insert or update if exists)
    const { data, error } = await supabase
      .from("quiz_results")
      .upsert({
        quiz_id,
        user_id: userId,
        score,
        total_questions,
        answers,
        time_taken: time_taken || 0,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'quiz_id,user_id',
        ignoreDuplicates: false,
      })
      .select();
    
    if (error) {
      console.error("Error saving quiz result:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");
    
    let query = supabase
      .from("quiz_results")
      .select(`
        result_id,
        quiz_id,
        score,
        total_questions,
        answers,
        completed_at,
        time_taken,
        quizzes(title, description)
      `)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });
    
    // If quizId is provided, filter by it
    if (quizId) {
      query = query.eq("quiz_id", quizId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching quiz results:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ results: data });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 