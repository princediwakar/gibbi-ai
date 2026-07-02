// Path: app/api/session/start/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SessionStartSchema } from "@/lib/validations/tutor";
import {
  selectTargetDomains,
  buildTutorUserMessage,
  getTutorSystemPrompt,
  computeDifficultyDistribution,
  type ConceptMasteryRow,
} from "@/lib/tutor-prompt";
import { getTimeMode } from "@/lib/sm2";
import { TUTOR_CONFIG, TUTOR_ERRORS } from "@/lib/constants/tutor";
import { normalizeSkillDomain } from "@/lib/services/skill-normalizer";
import { openai, MODEL } from "@/lib/ai";
import taxonomy from "@/lib/taxonomies.json";
import type { SessionQuestion, DifficultyTier, TimeMode } from "@/types/tutor";

const DIFFICULTY_TIER_MAP: Record<string, DifficultyTier> = {
  foundation: 1,
  application: 2,
  advanced: 3,
  expert: 3,
};

function normalizeDifficultyTier(tier: string | undefined): DifficultyTier {
  return DIFFICULTY_TIER_MAP[tier ?? ""] ?? 2;
}

function getTaxonomyDomains(examName: string): string[] {
  const map = taxonomy as unknown as Record<string, Record<string, string[]>>;
  const examTaxonomy = map[examName];
  if (!examTaxonomy) return [];
  return Object.values(examTaxonomy).flat();
}

interface SessionGenerationResult {
  session_id: string;
  questions: SessionQuestion[];
  target_domains: string[];
}

async function generateAndCreateSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  examProfileId: string,
  questionCount: number,
  focusDomains: string[] | undefined,
  profile: { exam_name: string; target_date: string; time_mode: string },
): Promise<{ result?: SessionGenerationResult; error?: string; details?: string; status?: number }> {
  const { count: dailyCount } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", new Date().toISOString().slice(0, 10));

  if ((dailyCount ?? 0) >= TUTOR_CONFIG.MAX_DAILY_SESSIONS) {
    return { error: TUTOR_ERRORS.RATE_LIMIT_EXCEEDED, status: 429 };
  }

  const targetDate = new Date(profile.target_date);
  const now = new Date();
  const daysRemaining = Math.max(
    1,
    Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const timeMode: TimeMode = (profile.time_mode as TimeMode) || getTimeMode(daysRemaining);
  const examYear = targetDate.getFullYear().toString();

  let taxonomyDomains = getTaxonomyDomains(profile.exam_name);

  if (focusDomains && focusDomains.length > 0) {
    const focusSet = new Set(focusDomains.map((d) => d.toLowerCase().trim()));
    const filtered = taxonomyDomains.filter((d) => focusSet.has(d.toLowerCase().trim()));
    if (filtered.length > 0) {
      taxonomyDomains = filtered;
    }
  }

  const { data: conceptRows } = await supabase
    .from("concept_mastery")
    .select("*")
    .eq("user_id", userId)
    .eq("exam_profile_id", examProfileId);

  const concepts: ConceptMasteryRow[] = (conceptRows ?? []).map((row) => ({
    skill_domain: row.skill_domain,
    mastery_score: row.mastery_score,
    review_interval_days: row.review_interval_days,
    next_review_at: row.next_review_at,
    last_seen_at: row.last_seen_at,
    total_attempted: row.total_attempted,
    total_correct: row.total_correct,
  }));

  const targetDomains = selectTargetDomains(concepts, taxonomyDomains, questionCount);

  const { data: recentWrongAnswers } = await supabase
    .from("session_answers")
    .select("question_id, skill_domain, session_id")
    .eq("user_id", userId)
    .eq("is_correct", false)
    .eq("was_revealed", false)
    .order("answered_at", { ascending: false })
    .limit(30);

  if (recentWrongAnswers && recentWrongAnswers.length > 0) {
    const sessionIds = [...new Set(recentWrongAnswers.map((a) => a.session_id))];
    const { data: wrongSessions } = await supabase
      .from("sessions")
      .select("id, questions_json")
      .in("id", sessionIds);

    if (wrongSessions) {
      const questionMisconceptionMap = new Map<string, string>();
      for (const ws of wrongSessions) {
        const qs = ws.questions_json as any[];
        if (!qs) continue;
        for (const q of qs) {
          if (q.question_id && q.misconception) {
            questionMisconceptionMap.set(q.question_id, q.misconception as string);
          }
        }
      }

      const errorsByDomain = new Map<string, string[]>();
      for (const a of recentWrongAnswers) {
        const misconception = questionMisconceptionMap.get(a.question_id);
        if (misconception && a.skill_domain) {
          const existing = errorsByDomain.get(a.skill_domain) || [];
          if (!existing.includes(misconception)) {
            existing.push(misconception);
          }
          errorsByDomain.set(a.skill_domain, existing);
        }
      }

      for (const td of targetDomains) {
        const errors = errorsByDomain.get(td.skillDomain);
        if (errors && errors.length > 0) {
          td.recentErrors = errors.slice(0, 3);
        }
      }
    }
  }

  const difficultyDistribution = computeDifficultyDistribution(questionCount, timeMode);
  const systemPrompt = getTutorSystemPrompt();
  const userMessage = buildTutorUserMessage({
    examName: profile.exam_name,
    examYear,
    timeMode,
    daysRemaining,
    targetDomains,
    questionCount,
    difficultyDistribution,
  });

  const targetDomainNames = targetDomains.map((d) => d.skillDomain);

  const maxTokens = questionCount * 250 + 1000;

  console.log(`[SessionStart] model=${MODEL} baseURL=${(openai as any).baseURL || "default"} domains=${targetDomainNames.length} questions=${questionCount}`);

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
    response_format: { type: "json_object" as const },
  });

  const rawResponse = completion.choices[0]?.message?.content || "";

  let parsedResponse: Record<string, unknown>;
  try {
    parsedResponse = JSON.parse(rawResponse);
  } catch (parseErr) {
    console.error("JSON parse failed. Raw response prefix:", rawResponse.slice(0, 500));
    return {
      error: TUTOR_ERRORS.AI_GENERATION_FAILED,
      details: `Model returned invalid JSON: ${(parseErr as Error).message}`,
      status: 500,
    };
  }

  const questionsArray = parsedResponse?.questions as unknown[] | undefined;
  if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
    const arrLen = Array.isArray(questionsArray) ? questionsArray.length : 0;
    console.error("No questions in response. Keys:", Object.keys(parsedResponse));
    return {
      error: TUTOR_ERRORS.AI_GENERATION_FAILED,
      details: `Model returned ${arrLen} questions (expected ${questionCount}). Response keys: ${Object.keys(parsedResponse).join(", ") || "none"}`,
      status: 500,
    };
  }

  const validatedQuestions: SessionQuestion[] = [];
  const validDomainNames = new Set(targetDomainNames.map((d) => d.toLowerCase().trim()));

  for (const q of questionsArray) {
    if (
      !q ||
      typeof q !== "object" ||
      !(q as any).question_text ||
      !(q as any).options ||
      !(q as any).correct_option
    ) {
      continue;
    }

    const rawDomain: string = (q as any).skill_domain || targetDomainNames[0] || "General";
    const normalizedDomain = validDomainNames.has(rawDomain.toLowerCase().trim())
      ? targetDomainNames.find(
          (d) => d.toLowerCase().trim() === rawDomain.toLowerCase().trim()
        ) || normalizeSkillDomain(rawDomain)
      : normalizeSkillDomain(rawDomain);

    validatedQuestions.push({
      question_id: crypto.randomUUID(),
      question_text: (q as any).question_text,
      options: (q as any).options,
      correct_option: (q as any).correct_option,
      explanation: (q as any).explanation || "",
      distractor_analysis: (q as any).distractor_analysis || {},
      skill_domain: normalizedDomain,
      difficulty_tier: normalizeDifficultyTier((q as any).difficulty_tier),
      time_estimate_seconds: (q as any).time_estimate_seconds || 60,
      misconception: (q as any).misconception || "",
    });
  }

  if (validatedQuestions.length === 0) {
    return {
      error: TUTOR_ERRORS.AI_GENERATION_FAILED,
      details: `All ${(questionsArray as unknown[]).length} generated questions failed validation. Target domains: ${targetDomainNames.join(", ") || "none"}`,
      status: 500,
    };
  }

  const { data: session, error: insertError } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      exam_profile_id: examProfileId,
      questions_json: validatedQuestions as any,
      target_domains: targetDomainNames,
      status: "active",
    })
    .select("id")
    .single();

  if (insertError || !session) {
    return { error: "Failed to create session. Try again.", status: 500 };
  }

  return {
    result: {
      session_id: session.id,
      questions: validatedQuestions,
      target_domains: targetDomainNames,
    },
  };
}

function streamSSE(controller: ReadableStreamDefaultController, data: Record<string, unknown>) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: TUTOR_ERRORS.UNAUTHORIZED }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = SessionStartSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input.", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { exam_profile_id, question_count, focus_domains } = parsed.data;

  const { data: profile, error: profileError } = await supabase
    .from("exam_profiles")
    .select("*")
    .eq("profile_id", exam_profile_id)
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return Response.json({ error: TUTOR_ERRORS.INVALID_EXAM_PROFILE }, { status: 400 });
  }

  const shouldStream = req.nextUrl.searchParams.get("stream") !== "false";

  if (!shouldStream) {
    try {
      const genResult = await generateAndCreateSession(
        supabase,
        user.id,
        exam_profile_id,
        question_count,
        focus_domains,
        profile,
      );

      if (genResult.error) {
        return Response.json(
          { error: genResult.error, details: genResult.details },
          { status: genResult.status ?? 500 },
        );
      }

      return Response.json({ session_id: genResult.result!.session_id });
    } catch (error: any) {
      console.error("SESSION START ERROR:", error.message || error);
      if (error.details) console.error("Supabase Details:", error.details);
      if (error.cause) console.error("Cause:", error.cause);
      return Response.json(
        { error: TUTOR_ERRORS.AI_GENERATION_FAILED, details: error.message },
        { status: 500 }
      );
    }
  }

  const questionCount = question_count;
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      function safeClose() {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }

      function safeStreamSSE(data: Record<string, unknown>) {
        if (closed) return;
        try {
          streamSSE(controller, data);
        } catch {
          closed = true;
        }
      }

      try {
        safeStreamSSE({ type: "connected" });

        const genResult = await generateAndCreateSession(
          supabase,
          user.id,
          exam_profile_id,
          questionCount,
          focus_domains,
          profile,
        );

        if (genResult.error || !genResult.result) {
          safeStreamSSE({ type: "error", message: genResult.error || "Internal server error." });
          safeClose();
          return;
        }

        safeStreamSSE({
          type: "progress",
          done: genResult.result.questions.length,
          total: questionCount,
          target_domains: genResult.result.target_domains,
        });

        safeStreamSSE({
          type: "complete",
          session_id: genResult.result.session_id,
          questions: genResult.result.questions,
          target_domains: genResult.result.target_domains,
        });
        safeClose();
      } catch (error) {
        safeStreamSSE({
          type: "error",
          message: (error as Error).message || "Internal server error.",
        });
        safeClose();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
