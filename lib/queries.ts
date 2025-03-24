// lib/queries.ts
import { supabase } from "./supabase/client";
import { supabaseAdmin } from "./supabase/admin";
import { Quiz } from "@/types/quiz";

// Local cache for creator names
const creatorNameCache = new Map<string, string>();

async function getCreatorName(creatorId: string): Promise<string> {
  if (creatorNameCache.has(creatorId)) {
    return creatorNameCache.get(creatorId)!;
  }

  const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(creatorId);
  if (error || !user) {
    console.error("Error fetching creator data:", error);
    return "Anonymous";
  }

  const displayName =
    user.user.user_metadata?.full_name ||
    user.user.user_metadata?.name ||
    user.user.email?.split("@")[0] ||
    "Anonymous";

  creatorNameCache.set(creatorId, displayName);
  return displayName;
}

export async function getPublicQuizzes(searchQuery: string = ""): Promise<Quiz[]> {
  try {
    console.log("[getPublicQuizzes] Starting with searchQuery:", searchQuery); // Debug

    let query = supabase
      .from("quiz_with_counts")
      .select("*")
      .eq("is_public", true)
      .eq("status", "ready")
      .order("created_at", { ascending: false });

    if (searchQuery) {
      console.log("[getPublicQuizzes] Applying filter for:", searchQuery); // Debug
      query = query.or(
        `title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,topic.ilike.%${searchQuery}%`
      );
    }

    const { data: quizzes, error: quizzesError } = await query;
    if (quizzesError) {
      console.error("[getPublicQuizzes] Query Error:", quizzesError);
      throw quizzesError;
    }

    console.log("[getPublicQuizzes] Quizzes fetched:", quizzes?.length || 0); // Debug

    if (!quizzes || quizzes.length === 0) {
      console.log("[getPublicQuizzes] No quizzes found for query:", searchQuery);
      return [];
    }

    const creatorIds = [...new Set(quizzes.map((q) => q.creator_id))];
    const creatorNames = await Promise.all(creatorIds.map((id) => getCreatorName(id)));
    const userMap = new Map(creatorIds.map((id, index) => [id, creatorNames[index]]));

    const enrichedQuizzes = quizzes.map((quiz) => ({
      ...quiz,
      creator_name: userMap.get(quiz.creator_id) || "Anonymous",
    }));

    console.log("[getPublicQuizzes] Returning enriched quizzes:", enrichedQuizzes.length); // Debug
    return enrichedQuizzes;
  } catch (error) {
    console.error("[getPublicQuizzes] Unexpected Error:", error);
    return [];
  }
}

export async function getQuizWithQuestions(quizId: string): Promise<Quiz | null> {
  try {
    const { data: quiz, error: quizError } = await supabase
      .from("quiz_with_counts")
      .select("*")
      .eq("quiz_id", quizId)
      .single();

    if (quizError || !quiz) return null;

    const creator_name = await getCreatorName(quiz.creator_id);

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId);

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      return null;
    }

    return {
      ...quiz,
      creator_name,
      questions: questions || [],
    };
  } catch (error) {
    console.error("Error fetching quiz with questions:", error);
    return null;
  }
}


export async function getQuizMetadata(quizId: string): Promise<Quiz | null> {
  try {
    const { data: quiz, error } = await supabase
      .from("quiz_with_counts")
      .select("*")
      .eq("quiz_id", quizId)
      .single();

    if (error || !quiz) return null;
    const creator_name = await getCreatorName(quiz.creator_id);

    return { ...quiz, creator_name };
  } catch (error) {
    console.error("Error fetching quiz metadata:", error);
    return null;
  }
}


export async function getQuestions(quizId: string) {
  try {
    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId);

    return {
      questions: questions || [],
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return null;
  }
}