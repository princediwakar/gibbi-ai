// Path: lib/services/usage-service.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { QUIZ_CONFIG } from "@/lib/constants/quiz";

const DAILY_GENERATION_LIMIT = QUIZ_CONFIG.DAILY_GENERATION_LIMIT;

function getServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function checkGenerationLimit(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  try {
    const supabase = getServiceClient();
    const today = new Date().toISOString().slice(0, 10);
    const { count, error } = await supabase
      .from("generation_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", today);

    if (error) {
      console.error("[RateLimit] Query error:", error);
      return { allowed: false, used: 0, limit: DAILY_GENERATION_LIMIT };
    }
    return {
      allowed: (count ?? 0) < DAILY_GENERATION_LIMIT,
      used: count ?? 0,
      limit: DAILY_GENERATION_LIMIT,
    };
  } catch (err) {
    console.error("[RateLimit] Supabase unreachable:", err);
    return { allowed: false, used: 0, limit: DAILY_GENERATION_LIMIT };
  }
}

export async function recordGeneration(
  userId: string,
  quizId: string,
  questionCount: number,
  tokenEstimate: number
): Promise<void> {
  try {
    const supabase = getServiceClient();
    await supabase.from("generation_usage").insert({
      user_id: userId,
      quiz_id: quizId,
      question_count: questionCount,
      token_estimate: tokenEstimate,
    });
  } catch (err) {
    console.error("[RateLimit] Failed to record usage:", err);
  }
}
