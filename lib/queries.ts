// lib/queries.ts
import { supabase } from "./supabase/client";
import {createClient} from "./supabase/server"
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

    let query = supabase
      .from("quiz_with_counts")
      .select("*")
      .eq("is_public", true)
      .eq("status", "ready")
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,topic.ilike.%${searchQuery}%`
      );
    }

    const { data: quizzes, error: quizzesError } = await query;
    if (quizzesError) {
      console.error("[getPublicQuizzes] Query Error:", quizzesError);
      throw quizzesError;
    }


    if (!quizzes || quizzes.length === 0) {
      return [];
    }

    const creatorIds = [...new Set(quizzes.map((q) => q.creator_id))];
    const creatorNames = await Promise.all(creatorIds.map((id) => getCreatorName(id)));
    const userMap = new Map(creatorIds.map((id, index) => [id, creatorNames[index]]));

    const enrichedQuizzes = quizzes.map((quiz) => ({
      ...quiz,
      creator_name: userMap.get(quiz.creator_id) || "Anonymous",
    }));

    return enrichedQuizzes;
  } catch (error) {
    console.error("[getPublicQuizzes] Unexpected Error:", error);
    return [];
  }
}

export async function getQuizWithQuestions(quizId: string): Promise<Quiz> {
  const supabase = await createClient();

  // Fetch quiz details
  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("quiz_id", quizId)
    .single();

  if (quizError || !quizData) {
    throw new Error(`Quiz not found: ${quizError?.message}`);
  }

  // Fetch standalone questions (group_id is null)
  const { data: standaloneQuestions, error: standaloneError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .is("group_id", null);

  if (standaloneError) {
    console.error("Error fetching standalone questions:", standaloneError.message);
  }

  // Fetch question groups with their supporting content
  const { data: questionGroups, error: groupsError } = await supabase
    .from("question_groups")
    .select("group_id, supporting_content_type, supporting_content, caption, group_order")
    .eq("quiz_id", quizId)
    .order("group_order", { ascending: true });

  if (groupsError) {
    console.error("Error fetching question groups:", groupsError.message);
    // Fallback: Try fetching without caption if column doesn't exist
    const { data: fallbackGroups, error: fallbackGroupsError } = await supabase
      .from("question_groups")
      .select("group_id, supporting_content_type, supporting_content, group_order")
      .eq("quiz_id", quizId)
      .order("group_order", { ascending: true });

    if (fallbackGroupsError) {
      console.error("Error fetching question groups (fallback):", fallbackGroupsError.message);
    }

    // Fetch questions for each group with fallback if caption fetch failed
    const questionGroupsWithQuestionsFallback = fallbackGroups?.length
      ? await Promise.all(
          fallbackGroups.map(async (group) => {
            const { data: groupQuestions, error: groupQuestionsError } = await supabase
              .from("questions")
              .select("*")
              .eq("group_id", group.group_id);

            if (groupQuestionsError) {
              console.error(`Error fetching questions for group ${group.group_id}:`, groupQuestionsError.message);
              return { ...group, questions: [] };
            }

            return {
              ...group,
              supporting_content: {
                type: group.supporting_content_type,
                content: group.supporting_content,
                caption: "", // Default to empty string since caption column may not exist
              },
              questions: groupQuestions || [],
            };
          })
        )
      : [];

    return {
      ...quizData,
      questions: standaloneQuestions || [],
      question_groups: questionGroupsWithQuestionsFallback || [],
    };
  }

  // Fetch questions for each group if caption fetch succeeded
  const questionGroupsWithQuestions = questionGroups?.length
    ? await Promise.all(
        questionGroups.map(async (group) => {
          const { data: groupQuestions, error: groupQuestionsError } = await supabase
            .from("questions")
            .select("*")
            .eq("group_id", group.group_id);

          if (groupQuestionsError) {
            console.error(`Error fetching questions for group ${group.group_id}:`, groupQuestionsError.message);
            return { ...group, questions: [] };
          }

          return {
            ...group,
            supporting_content: {
              type: group.supporting_content_type,
              content: group.supporting_content,
              caption: group.caption || "", // Use empty string if caption is null or undefined
            },
            questions: groupQuestions || [],
          };
        })
      )
    : [];

  return {
    ...quizData,
    questions: standaloneQuestions || [],
    question_groups: questionGroupsWithQuestions || [],
  };
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