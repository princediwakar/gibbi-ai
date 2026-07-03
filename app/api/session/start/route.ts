// Path: app/api/session/start/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SessionStartSchema } from "@/lib/validations/tutor";
import {
  selectTargetDomains,
  buildTutorUserMessage,
  buildDiagnosticUserMessage,
  getTutorSystemPrompt,
  computeDifficultyDistribution,
  type ConceptMasteryRow,
  type TargetDomain,
} from "@/lib/tutor-prompt";
import { getTimeMode } from "@/lib/sm2";
import { TUTOR_CONFIG, TUTOR_ERRORS } from "@/lib/constants/tutor";
import { normalizeSkillDomain } from "@/lib/services/skill-normalizer";
import { openai, MODEL } from "@/lib/ai";
import { QuestionSchema } from "@/lib/schemas/quiz";
import { parseWithRecovery } from "@/lib/parse/quiz";
import { getDiagnosticStrata } from "@/lib/diagnostic-seed";
import { getDomainsForExam } from "@/lib/services/taxonomy";
import type { SessionQuestion, DifficultyTier, TimeMode } from "@/types/tutor";
import { computePriorityScores } from "@/lib/priority-engine";

const DIFFICULTY_TIER_MAP: Record<string, DifficultyTier> = {
  foundation: 1,
  application: 2,
  advanced: 3,
  expert: 3,
};

function normalizeDifficultyTier(tier: string | undefined): DifficultyTier {
  return DIFFICULTY_TIER_MAP[tier ?? ""] ?? 2;
}

function buildTargetDomainsFromFocus(
  focusDomains: string[],
  concepts: ConceptMasteryRow[],
): TargetDomain[] {
  const conceptByDomain = new Map(concepts.map((c) => [c.skill_domain, c]));
  const now = new Date().toISOString();

  return focusDomains.map((domain) => {
    const row = conceptByDomain.get(domain);
    return {
      skillDomain: domain,
      masteryScore: row?.mastery_score ?? 0,
      recentErrors: [],
      isOverdue: row ? row.next_review_at <= now : true,
      lastSeenAt: row?.last_seen_at ?? null,
    };
  });
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
  sessionIntent: string,
  profile: { exam_name: string; target_date: string; time_mode: string },
): Promise<{ result?: SessionGenerationResult; error?: string; details?: string; status?: number }> {
  // ----- Daily Session Rate Limiting -----
  const { count: dailyCount } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", new Date().toISOString().slice(0, 10));

  if ((dailyCount ?? 0) >= TUTOR_CONFIG.MAX_DAILY_SESSIONS) {
    return { error: TUTOR_ERRORS.RATE_LIMIT_EXCEEDED, status: 429 };
  }

  // ----- Profile & Time Mode -----
  const targetDate = new Date(profile.target_date);
  const now = new Date();
  const daysRemaining = Math.max(
    1,
    Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const timeMode: TimeMode = (profile.time_mode as TimeMode) || getTimeMode(daysRemaining);
  const examYear = targetDate.getFullYear().toString();

  // ----- Load Concepts -----
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

  // ----- Domain Selection (Intent-Aware) -----
  let targetDomains: TargetDomain[];

  const isTracked = sessionIntent === "tracked";
  const isQuiet = sessionIntent === "quiet";
  const isActiveTarget = sessionIntent === "active_target";
  const isCustomMock = sessionIntent === "custom_mock";
  const isDiagnostic = sessionIntent === "diagnostic";
  const isSpacedReview = sessionIntent === "spaced_review";

  // For active_target/custom_mock — use focus_domains directly
  if (isActiveTarget || isCustomMock) {
    if (!focusDomains || focusDomains.length === 0) {
      return {
        error: `focus_domains is required for ${sessionIntent} sessions.`,
        status: 400,
      };
    }
    targetDomains = buildTargetDomainsFromFocus(focusDomains, concepts);
  } else if (isDiagnostic) {
    // Diagnostic uses fixed strata
    const taxonomyDomains = getDomainsForExam(profile.exam_name);
    targetDomains = selectTargetDomains(concepts, taxonomyDomains, questionCount);
  } else {
    // tracked, quiet, spaced_review — use Priority Engine
    const masteryScores: Record<string, number> = {};
    const nextReviewDates: Record<string, Date> = {};
    const lastSeenDates: Record<string, Date | null> = {};
    const totalAttempted: Record<string, number> = {};

    for (const c of concepts) {
      masteryScores[c.skill_domain] = c.mastery_score;
      nextReviewDates[c.skill_domain] = new Date(c.next_review_at);
      lastSeenDates[c.skill_domain] = c.last_seen_at ? new Date(c.last_seen_at) : null;
      totalAttempted[c.skill_domain] = c.total_attempted;
    }

    const priorities = await computePriorityScores({
      userId,
      examProfileId,
      examName: profile.exam_name,
      masteryScores,
      nextReviewDates,
      lastSeenDates,
      totalAttempted,
      timeMode,
      daysRemaining,
    });

    // Take top N domains
    const topDomains = priorities.slice(0, questionCount).map((p) => p.skillDomain);

    // Build TargetDomain objects with priority info
    const conceptByDomain = new Map(concepts.map((c) => [c.skill_domain, c]));
    const now = new Date().toISOString();

    targetDomains = topDomains.map((domain) => {
      const row = conceptByDomain.get(domain);
      const priority = priorities.find((p) => p.skillDomain === domain);
      return {
        skillDomain: domain,
        masteryScore: row?.mastery_score ?? 0,
        recentErrors: [],
        isOverdue: row ? row.next_review_at <= now : true,
        lastSeenAt: row?.last_seen_at ?? null,
        priorityScore: priority?.priorityScore ?? 0,
        difficultyTier: priority?.difficultyTier,
      };
    });
  }

  // ----- Recent Wrong Answers Enrichment -----
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

  // ----- Prompt Generation (Intent-Aware) -----
  const systemPrompt = getTutorSystemPrompt();
  const difficultyDistribution = isDiagnostic
    ? { easy: 1, medium: 2, hard: 2 }
    : computeDifficultyDistribution(questionCount, timeMode);

  let userMessage: string;
  if (isDiagnostic) {
    const strata = getDiagnosticStrata();
    userMessage = buildDiagnosticUserMessage({
      examName: profile.exam_name,
      examYear,
      strata,
    });
  } else {
    userMessage = buildTutorUserMessage({
      examName: profile.exam_name,
      examYear,
      timeMode,
      daysRemaining,
      targetDomains,
      questionCount,
      difficultyDistribution,
    });
  }

  const targetDomainNames = targetDomains.map((d) => d.skillDomain);
  const maxTokens = questionCount * 600 + 1000;

  console.log(
    `[SessionStart] model=${MODEL} baseURL=${(openai as any).baseURL || "default"} ` +
    `domains=${targetDomainNames.length} questions=${questionCount} intent=${sessionIntent}`,
  );

  // ----- AI Generation with Retry via parseWithRecovery -----
  async function callAI(temp: number, promptOverride?: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: promptOverride ?? userMessage },
      ],
      temperature: temp,
      max_tokens: maxTokens,
      response_format: { type: "json_object" as const },
    });
    return completion.choices[0]?.message?.content || "";
  }

  const retryFn1 = () => callAI(0.7);
  const retryFn2 = () => callAI(0.95);

  // First attempt
  const firstResponse = await callAI(0.7);

  let questionsArray: unknown[];
  try {
    const recoveryResult = await parseWithRecovery(
      firstResponse,
      QuestionSchema,
      questionCount,
      retryFn1,
      retryFn2,
    );
    questionsArray = recoveryResult.questions;
  } catch (err) {
    // Last resort: emergency fallback with a bare-minimum prompt
    try {
      const fallbackPrompt = `Generate ${questionCount} multiple choice questions about ${targetDomainNames.join(", ")} for ${profile.exam_name} exam preparation. Each question must have: question_text (string), options (object with keys A, B, C, D mapping to answer strings), correct_option (the letter key of the correct answer), and explanation (string). Return valid JSON: {"questions": [...]}`;

      const emergencyRaw = await callAI(1.0, fallbackPrompt);
      const emergencyResult = await parseWithRecovery(
        emergencyRaw,
        QuestionSchema,
        questionCount,
        () => callAI(1.0, fallbackPrompt),
      );
      questionsArray = emergencyResult.questions;
    } catch {
      const details =
        err instanceof Error ? err.message : "Unknown parse/recovery error";
      return {
        error: TUTOR_ERRORS.AI_GENERATION_FAILED,
        details,
        status: 500,
      };
    }
  }

  if (questionsArray.length === 0) {
    return {
      error: TUTOR_ERRORS.AI_GENERATION_FAILED,
      details: `AI generated 0 valid questions. Target domains: ${targetDomainNames.join(", ") || "none"}`,
      status: 500,
    };
  }

  // ----- Validate and Normalize Questions -----
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
          (d) => d.toLowerCase().trim() === rawDomain.toLowerCase().trim(),
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
      details: `All ${questionsArray.length} generated questions failed validation. Target domains: ${targetDomainNames.join(", ") || "none"}`,
      status: 500,
    };
  }

  // ----- Insert Session -----
  const { data: session, error: insertError } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      exam_profile_id: examProfileId,
      questions_json: validatedQuestions as any,
      target_domains: targetDomainNames,
      session_intent: sessionIntent,
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
      { status: 400 },
    );
  }

  const { exam_profile_id, question_count, focus_domains, session_intent } = parsed.data;

  const { data: profile, error: profileError } = await supabase
    .from("exam_profiles")
    .select("*")
    .eq("profile_id", exam_profile_id)
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return Response.json({ error: TUTOR_ERRORS.INVALID_EXAM_PROFILE }, { status: 400 });
  }

  // Diagnostic always uses 5 questions
  const effectiveQuestionCount =
    session_intent === "diagnostic"
      ? TUTOR_CONFIG.DIAGNOSTIC_QUESTION_COUNT
      : question_count;

  const shouldStream = req.nextUrl.searchParams.get("stream") !== "false";

  if (!shouldStream) {
    try {
      const genResult = await generateAndCreateSession(
        supabase,
        user.id,
        exam_profile_id,
        effectiveQuestionCount,
        focus_domains,
        session_intent,
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
        { status: 500 },
      );
    }
  }

  // ----- Streaming SSE -----
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
          effectiveQuestionCount,
          focus_domains,
          session_intent,
          profile,
        );

        if (genResult.error || !genResult.result) {
          safeStreamSSE({
            type: "error",
            message: genResult.error || "Internal server error.",
          });
          safeClose();
          return;
        }

        safeStreamSSE({
          type: "progress",
          done: genResult.result.questions.length,
          total: effectiveQuestionCount,
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
