// Path: app/dashboard/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TUTOR_ROUTES } from "@/lib/constants/tutor";
import { calculateWeightedReadinessIndex, getTimeMode } from "@/lib/sm2";
import { computeStreak } from "@/lib/utils";
import { DashboardView, DashboardViewLoading } from "@/components/tutor/DashboardView";
import type { ExamProfile, ConceptMastery, TimeMode } from "@/types/tutor";
import type { ProjectionHeroProps } from "@/components/tutor/ProjectionHero";
import { marksToPercentile, getColdStartBand, computeCompositePercentile } from "@/lib/predictor/nta-priors";
import taxonomy from "@/lib/taxonomies.json";

interface ConceptRow {
  id: string;
  skill_domain: string;
  mastery_score: number;
  total_attempted: number;
  total_correct: number;
  next_review_at: string;
}

export interface DashboardPageData {
  readinessIndex: number;
  daysRemaining: number;
  timeMode: TimeMode;
  domainBreakdown: { domain: string; score: number; totalAttempted: number }[];
  quickStats: {
    totalQuestions: number;
    streak: number;
    sessionsCompleted: number;
  };
  examName: string;
  profileId: string;
  activeTargets: string[];
  overdueDomainCount: number;
  weakestOverdueDomain: string | null;
  prediction: ProjectionHeroProps["prediction"];
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardViewLoading />}>
      <DashboardPageContent />
    </Suspense>
  );
}

async function DashboardPageContent() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  // --- Diagnostic Gatekeeper ---
  const { data: diagnosticSession } = await supabase
    .from("sessions")
    .select("id, status, session_intent")
    .eq("user_id", user.id)
    .eq("session_intent", "diagnostic")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: conceptCount } = await supabase
    .from("concept_mastery")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (diagnosticSession) {
    redirect(TUTOR_ROUTES.SESSION(diagnosticSession.id));
  }

  if ((conceptCount ?? 0) === 0) {
    redirect(TUTOR_ROUTES.SETUP);
  }

  // --- Fetch all dashboard data in parallel ---
  const [
    profileRes,
    conceptsRes,
    questionResultsRes,
    completedSessionsRes,
    overdueCountRes,
    predictionRes,
  ] = await Promise.all([
    supabase
      .from("exam_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single(),
    supabase
      .from("concept_mastery")
      .select("id, skill_domain, mastery_score, total_attempted, total_correct, next_review_at")
      .eq("user_id", user.id),
    supabase
      .from("session_answers")
      .select("answered_at")
      .eq("user_id", user.id)
      .order("answered_at", { ascending: false })
      .limit(500),
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("concept_mastery")
      .select("id")
      .eq("user_id", user.id)
      .lt("next_review_at", new Date().toISOString()),
    supabase
      .from("predictions")
      .select("predicted_percentile, band_lower, band_upper, calibration_source, sessions_used, is_frozen")
      .eq("user_id", user.id)
      .eq("is_frozen", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileRes.error || !profileRes.data) {
    redirect(TUTOR_ROUTES.SETUP);
  }

  const profile = profileRes.data as ExamProfile;
  const concepts = (conceptsRes.data || []) as ConceptRow[];
  const questionResults = (questionResultsRes.data || []) as { answered_at: string }[];

  const overdueDomainCount = overdueCountRes.count ?? 0;

  const examTaxonomy = taxonomy as unknown as Record<string, Record<string, string[]>>;
  const examSubjects = examTaxonomy[profile.exam_name];
  const allDomains: string[] = examSubjects
    ? [...new Set(Object.values(examSubjects).flat())]
    : [];

  const masteryMap: Record<string, number> = {};
  const domainAttempted: Record<string, number> = {};
  for (const c of concepts) {
    masteryMap[c.skill_domain] = c.mastery_score;
    domainAttempted[c.skill_domain] = c.total_attempted;
  }

  const now = new Date();
  const targetDate = new Date(profile.target_date);
  const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / 86400000));

  const readinessIndex = Math.round(
    allDomains.length > 0
      ? calculateWeightedReadinessIndex(masteryMap, allDomains)
      : 0
  );

  const timeMode: TimeMode = getTimeMode(daysRemaining);

  const domainBreakdown = allDomains.map((domain) => ({
    domain,
    score: masteryMap[domain] ?? 0,
    totalAttempted: domainAttempted[domain] ?? 0,
  }));

  const overdueConcepts = concepts.filter(
    (c) => new Date(c.next_review_at) < now
  );
  const weakestOverdueDomain =
    overdueConcepts.length > 0
      ? [...overdueConcepts].sort((a, b) => a.mastery_score - b.mastery_score)[0].skill_domain
      : null;

  const streak = computeStreak(questionResults);
  const sessionsCompleted = completedSessionsRes.count ?? 0;

  const data: DashboardPageData = {
    readinessIndex,
    daysRemaining,
    timeMode,
    domainBreakdown,
    quickStats: {
      totalQuestions: questionResults.length,
      streak,
      sessionsCompleted,
    },
    examName: profile.exam_name,
    profileId: profile.profile_id,
    activeTargets: profile.active_targets ?? [],
    overdueDomainCount,
    weakestOverdueDomain,
    prediction: predictionRes.data
      ? (() => {
          const lower = predictionRes.data.band_lower;
          const upper = predictionRes.data.band_upper;
          const sessions = predictionRes.data.sessions_used ?? 0;
          return {
            overallPercentile: predictionRes.data.predicted_percentile ?? 0,
            overallBandLower: lower,
            overallBandUpper: upper,
            overallBandWidth: Math.round((upper - lower) * 100) / 100,
            calibrationSource: predictionRes.data.calibration_source ?? "public_nta",
            disclaimer: sessions >= 20
              ? "Fully calibrated to your personal practice history."
              : sessions > 0
                ? `Prediction blends public NTA data with your ${sessions} tracked session${sessions > 1 ? "s" : ""}. Band sharpens with each session.`
                : "Based on public NTA normalization tables (2025–2026 cycles). Your band sharpens with every tracked session.",
            isFrozen: predictionRes.data.is_frozen ?? false,
            totalTrackedSessions: sessions,
          };
        })()
      : (() => {
          // Cold-start: generate band from public NTA priors (zero tracked sessions)
          const p = marksToPercentile("Physics", 50);
          const c = marksToPercentile("Chemistry", 50);
          const m = marksToPercentile("Mathematics", 50);
          const overall = computeCompositePercentile({ Physics: p, Chemistry: c, Mathematics: m });
          const band = getColdStartBand("Physics", overall);
          return {
            overallPercentile: overall,
            overallBandLower: band.lower,
            overallBandUpper: band.upper,
            overallBandWidth: band.width,
            calibrationSource: "public_nta",
            disclaimer: "Based on public NTA normalization tables (2025–2026 cycles). Your band sharpens with every tracked session.",
            isFrozen: false,
            totalTrackedSessions: 0,
          };
        })(),
  };

  return <DashboardView data={data} />;
}
