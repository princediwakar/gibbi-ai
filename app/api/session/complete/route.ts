// Path: app/api/session/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SessionCompleteSchema } from "@/lib/validations/tutor";
import { gradeQuality, updateSM2, calculateReadinessIndex, getManualAttemptsToday, applyLogarithmicDecay, computeEarlyReviewPush } from "@/lib/sm2";
import { TUTOR_CONFIG } from "@/lib/constants/tutor";
import { seedDiagnosticPriors } from "@/lib/diagnostic-seed";
import type { SessionQuestion } from "@/types/tutor";
import { getDomainsForExam } from "@/lib/services/taxonomy";
import { type ConceptMasteryRow } from "@/lib/tutor-prompt";

const { SM2_DEFAULTS } = TUTOR_CONFIG;

interface QuestionResultRow {
  question_id: string;
  skill_domain: string;
  is_correct: boolean;
  was_revealed: boolean;
  time_to_answer_ms: number | null;
}

interface SM2LocalState {
  masteryScore: number;
  easeFactor: number;
  intervalDays: number;
  streak: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sign in to complete your session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = SessionCompleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { session_id } = parsed.data;

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, user_id, exam_profile_id, questions_json, target_domains, session_intent, status")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json(
        { error: "Sign in to access your practice sessions." },
        { status: 403 }
      );
    }

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "This session has already been completed." },
        { status: 409 }
      );
    }

    const { data: examProfile, error: profileError } = await supabase
      .from("exam_profiles")
      .select("exam_name, time_mode")
      .eq("profile_id", session.exam_profile_id)
      .single();

    if (profileError || !examProfile) {
      return NextResponse.json({ error: "Exam profile not found." }, { status: 404 });
    }

    const { data: questionResults, error: resultsError } = await supabase
      .from("session_answers")
      .select("question_id, skill_domain, is_correct, was_revealed, time_to_answer_ms")
      .eq("session_id", session_id);

    if (resultsError) {
      return NextResponse.json(
        { error: "Failed to load session results." },
        { status: 500 }
      );
    }

    const questions = session.questions_json as SessionQuestion[];
    const questionMap = new Map<string, { time_estimate_seconds: number; skill_domain: string }>();
    for (const q of questions) {
      questionMap.set(q.question_id, {
        time_estimate_seconds: q.time_estimate_seconds,
        skill_domain: q.skill_domain,
      });
    }

    const { data: existingMastery, error: masteryError } = await supabase
      .from("concept_mastery")
      .select("skill_domain, mastery_score, review_interval_days, review_ease_factor, streak, next_review_at, last_seen_at, total_attempted, total_correct")
      .eq("user_id", user.id)
      .eq("exam_profile_id", session.exam_profile_id);

    if (masteryError) {
      return NextResponse.json(
        { error: "Failed to load mastery data." },
        { status: 500 }
      );
    }

    const masteryMap = new Map<string, ConceptMasteryRow>();
    for (const row of existingMastery || []) {
      masteryMap.set(row.skill_domain, row);
    }

    const allDomains = getDomainsForExam(examProfile.exam_name);
    const beforeScores: Record<string, number> = {};
    for (const row of existingMastery || []) {
      beforeScores[row.skill_domain] = row.mastery_score;
    }
    const now = new Date();
    const nowIso = now.toISOString();

    const readinessBefore = calculateReadinessIndex(beforeScores, allDomains);

    const sessionIntent: string = (session as any).session_intent ?? "spaced_review";

    // ----- Diagnostic Path: Seed Priors & Skip SM-2 -----
    if (sessionIntent === "diagnostic") {
      const diagnosticResults = (questionResults || []).map((qr) => {
        const qMeta = questionMap.get(qr.question_id);
        return {
          skill_domain: qr.skill_domain,
          is_correct: qr.is_correct,
          time_to_answer_ms: qr.time_to_answer_ms ?? 0,
          time_estimate_seconds: qMeta?.time_estimate_seconds ?? 60,
        };
      });

      const { readinessIndex } = await seedDiagnosticPriors({
        userId: user.id,
        examProfileId: session.exam_profile_id,
        sessionId: session.id,
        examName: examProfile.exam_name,
        questionResults: diagnosticResults as any,
      });

      const cardData = {
        exam_name: examProfile.exam_name,
        session_date: nowIso,
        total_questions: (questionResults || []).length,
        correct_count: (questionResults || []).filter((qr) => qr.is_correct).length,
        score_pct: (questionResults || []).length > 0
          ? Math.round(((questionResults || []).filter((qr) => qr.is_correct).length / (questionResults || []).length) * 100)
          : 0,
        time_mode: examProfile.time_mode,
        domains_covered: [...new Set((questionResults || []).map((qr) => qr.skill_domain))],
        mastery_deltas: [],
        readiness_before: Math.round(readinessBefore),
        readiness_after: Math.round(readinessIndex),
      };

      const { data: cardRows, error: cardError } = await supabaseAdmin
        .from("result_cards")
        .insert({ user_id: user.id, card_type: "session", card_data: cardData })
        .select("share_token")
        .single();

      const shareToken = cardRows?.share_token ?? "diagnostic";

      await supabase
        .from("sessions")
        .update({ status: "completed", completed_at: nowIso })
        .eq("id", session_id);

      return NextResponse.json({
        mastery_updates: [],
        readiness_index: Math.round(readinessIndex),
        share_token: shareToken,
      });
    }

    // ----- Fetch Manual Attempts for Active Target Decay -----
    let manualAttempts: Map<string, number> = new Map();
    if (sessionIntent === "active_target") {
      manualAttempts = await getManualAttemptsToday(user.id, supabase);
    }

    const domainResults = new Map<string, QuestionResultRow[]>();
    for (const qr of questionResults || []) {
      if (qr.was_revealed) continue;
      if (!domainResults.has(qr.skill_domain)) {
        domainResults.set(qr.skill_domain, []);
      }
      domainResults.get(qr.skill_domain)!.push(qr);
    }

    const masteryUpdates: Array<{
      skill_domain: string;
      mastery_score: number;
      streak: number;
      next_review_at: string;
      interval_days: number;
      ease_factor: number;
    }> = [];
    const masteryDeltas: Array<{ domain: string; before: number; after: number }> = [];
    const masteryHistoryRows: Array<{
      user_id: string;
      exam_profile_id: string;
      skill_domain: string;
      mastery_score: number;
      recorded_at: string;
    }> = [];
    const conceptMasteryUpserts: Array<{
      user_id: string;
      exam_profile_id: string;
      skill_domain: string;
      mastery_score: number;
      review_interval_days: number;
      review_ease_factor: number;
      streak: number;
      last_seen_at: string;
      next_review_at: string;
    }> = [];

    for (const [domain, results] of domainResults) {
      const existing = masteryMap.get(domain);
      const beforeScore = existing?.mastery_score ?? 0.5;

      let currentState: SM2LocalState = {
        masteryScore: existing?.mastery_score ?? 0.5,
        easeFactor: existing?.review_ease_factor ?? SM2_DEFAULTS.initial_ease_factor,
        intervalDays: existing?.review_interval_days ?? SM2_DEFAULTS.initial_interval_days,
        streak: existing?.streak ?? 0,
      };

      for (const qr of results) {
        const qMeta = questionMap.get(qr.question_id);
        const timeEstimateSec = qMeta?.time_estimate_seconds ?? 60;
        const timeMs = qr.time_to_answer_ms ?? 0;
        const quality = gradeQuality(qr.is_correct, timeMs, timeEstimateSec);
        const result = updateSM2(currentState, quality);
        currentState = {
          masteryScore: result.masteryScore,
          easeFactor: result.easeFactor,
          intervalDays: result.intervalDays,
          streak: result.streak,
        };
      }

      let afterScore = currentState.masteryScore;
      let intervalDays = currentState.intervalDays;

      // Active Target: apply logarithmic decay on mastery gain
      if (sessionIntent === "active_target") {
        const manualCount = manualAttempts.get(domain) ?? 1;
        const delta = afterScore - beforeScore;
        const decayedDelta = applyLogarithmicDecay(delta, manualCount);
        afterScore = beforeScore + decayedDelta;
      }

      // Custom Mock: push review far out on 100% scores for topics not due soon
      let nextReviewAt = new Date(now.getTime() + intervalDays * 86400000);
      if (sessionIntent === "custom_mock") {
        const allCorrect = results.every((qr) => qr.is_correct);
        if (allCorrect) {
          const pushDays = computeEarlyReviewPush(1.0, nextReviewAt);
          if (pushDays !== null) {
            intervalDays = pushDays;
            nextReviewAt = new Date(now.getTime() + pushDays * 86400000);
          }
        }
      }

      masteryUpdates.push({
        skill_domain: domain,
        mastery_score: Math.round(afterScore * 100) / 100,
        streak: currentState.streak,
        next_review_at: nextReviewAt.toISOString(),
        interval_days: intervalDays,
        ease_factor: currentState.easeFactor,
      });

      masteryDeltas.push({
        domain,
        before: Math.round(beforeScore * 100) / 100,
        after: Math.round(afterScore * 100) / 100,
      });

      masteryHistoryRows.push({
        user_id: user.id,
        exam_profile_id: session.exam_profile_id,
        skill_domain: domain,
        mastery_score: afterScore,
        recorded_at: nowIso,
      });

      conceptMasteryUpserts.push({
        user_id: user.id,
        exam_profile_id: session.exam_profile_id,
        skill_domain: domain,
        mastery_score: afterScore,
        review_interval_days: intervalDays,
        review_ease_factor: currentState.easeFactor,
        streak: currentState.streak,
        last_seen_at: nowIso,
        next_review_at: nextReviewAt.toISOString(),
      });
    }

    const revealedDomains = new Set<string>();
    for (const qr of questionResults || []) {
      if (qr.was_revealed) {
        revealedDomains.add(qr.skill_domain);
      }
    }
    for (const domain of revealedDomains) {
      if (!domainResults.has(domain)) {
        const existing = masteryMap.get(domain);
        const score = existing?.mastery_score ?? 0.5;
        masteryHistoryRows.push({
          user_id: user.id,
          exam_profile_id: session.exam_profile_id,
          skill_domain: domain,
          mastery_score: score,
          recorded_at: nowIso,
        });
      }
    }

    const afterScores: Record<string, number> = { ...beforeScores };
    for (const update of conceptMasteryUpserts) {
      afterScores[update.skill_domain] = update.mastery_score;
    }
    const readinessAfter = calculateReadinessIndex(afterScores, allDomains);

    const results = questionResults || [];
    const totalQuestions = results.length;
    const correctCount = results.filter((qr) => qr.is_correct).length;
    const domainsCovered = [...new Set(results.map((qr) => qr.skill_domain))];

    // Build map of question_id -> result for hardest-question detection
    const resultByQid = new Map<string, QuestionResultRow>();
    for (const qr of results) {
      resultByQid.set(qr.question_id, qr);
    }

    // Find the hardest question: highest difficulty_tier, then longest time, then incorrect
    let hardestQuestion: { question: SessionQuestion; result: QuestionResultRow } | null = null;
    for (const q of questions) {
      const result = resultByQid.get(q.question_id);
      if (!result) continue;

      if (!hardestQuestion) {
        hardestQuestion = { question: q, result };
      } else {
        const currTier = q.difficulty_tier;
        const bestTier = hardestQuestion.question.difficulty_tier;
        if (currTier > bestTier) {
          hardestQuestion = { question: q, result };
        } else if (currTier === bestTier) {
          const currTime = result.time_to_answer_ms ?? 0;
          const bestTime = hardestQuestion.result.time_to_answer_ms ?? 0;
          if (currTime > bestTime) {
            hardestQuestion = { question: q, result };
          } else if (
            currTime === bestTime &&
            !result.is_correct &&
            hardestQuestion.result.is_correct
          ) {
            hardestQuestion = { question: q, result };
          }
        }
      }
    }

    // Identify mastered domains: mastery went from <0.7 to >=0.7
    const masteredDomains: string[] = [];
    for (const delta of masteryDeltas) {
      if (delta.before < 0.7 && delta.after >= 0.7) {
        masteredDomains.push(delta.domain);
      }
    }

    const cardData = {
      exam_name: examProfile.exam_name,
      session_date: nowIso,
      total_questions: totalQuestions,
      correct_count: correctCount,
      score_pct: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
      time_mode: examProfile.time_mode,
      domains_covered: domainsCovered,
      mastery_deltas: masteryDeltas,
      readiness_before: Math.round(readinessBefore),
      readiness_after: Math.round(readinessAfter),
      hardest_question: hardestQuestion
        ? {
            question_text: hardestQuestion.question.question_text,
            options: hardestQuestion.question.options,
            correct_option: hardestQuestion.question.correct_option,
            explanation: hardestQuestion.question.explanation,
            skill_domain: hardestQuestion.question.skill_domain,
            difficulty_tier: hardestQuestion.question.difficulty_tier,
          }
        : null,
      mastered_domains: masteredDomains.length > 0 ? masteredDomains : null,
    };

    if (conceptMasteryUpserts.length > 0) {
      const { error: upsertError } = await supabase
        .from("concept_mastery")
        .upsert(conceptMasteryUpserts, {
          onConflict: "user_id, exam_profile_id, skill_domain",
        });

      if (upsertError) {
        console.error("[SessionComplete] concept_mastery upsert error:", upsertError);
        return NextResponse.json(
          { error: "Failed to update mastery data." },
          { status: 500 }
        );
      }
    }

    if (masteryHistoryRows.length > 0) {
      const { error: historyError } = await supabaseAdmin
        .from("mastery_history")
        .insert(masteryHistoryRows);

      if (historyError) {
        console.error("[SessionComplete] mastery_history insert error:", historyError);
        return NextResponse.json(
          { error: "Failed to record mastery history." },
          { status: 500 }
        );
      }
    }

    const { data: cardRows, error: cardError } = await supabaseAdmin
      .from("result_cards")
      .insert({
        user_id: user.id,
        card_type: "session",
        card_data: cardData,
      })
      .select("share_token")
      .single();

    if (cardError || !cardRows) {
      console.error("[SessionComplete] result_cards insert error:", cardError);
      return NextResponse.json(
        { error: "Failed to create result card." },
        { status: 500 }
      );
    }

    const { error: completeError } = await supabase
      .from("sessions")
      .update({
        status: "completed",
        completed_at: nowIso,
      })
      .eq("id", session_id);

    if (completeError) {
      console.error("[SessionComplete] session update error:", completeError);
      return NextResponse.json(
        { error: "Failed to complete session." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mastery_updates: masteryUpdates.map((u) => ({
        skill_domain: u.skill_domain,
        mastery_score: u.mastery_score,
        streak: u.streak,
        next_review_at: u.next_review_at,
      })),
      readiness_index: Math.round(readinessAfter),
      share_token: cardRows.share_token,
    });
  } catch (error) {
    console.error("[SessionComplete] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
