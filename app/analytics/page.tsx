// Path: app/analytics/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { calculateReadinessIndex } from "@/lib/sm2";
import { computeStreak } from "@/lib/utils";
import { AnalyticsView } from "@/components/tutor/AnalyticsView";
import type { TimeMode } from "@/types/tutor";
import taxonomy from "@/lib/taxonomies.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | GibbiAI",
  description: "Track your mastery, readiness, and progress over time",
};

interface ConceptRow {
  id: string;
  skill_domain: string;
  mastery_score: number;
  total_attempted: number;
  total_correct: number;
  next_review_at: string;
}

interface SessionRow {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  target_domains: string[];
}

export interface AnalyticsPageData {
  readinessIndex: number;
  totalQuestions: number;
  sessionsCompleted: number;
  streak: number;
  domainBreakdown: { domain: string; score: number; totalAttempted: number }[];
  recentSessions: SessionRow[];
  examName: string;
}


export default function AnalyticsPage() {
  return (
    <Suspense>
      <AnalyticsPageContent />
    </Suspense>
  );
}

async function AnalyticsPageContent() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/");

  const [
    profileRes,
    conceptsRes,
    recentSessionsRes,
    questionResultsRes,
    completedSessionsRes,
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
      .from("sessions")
      .select("id, status, created_at, completed_at, target_domains")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
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
  ]);

  if (profileRes.error || !profileRes.data) redirect("/setup");

  const concepts = (conceptsRes.data || []) as ConceptRow[];
  const recentSessions = (recentSessionsRes.data || []) as SessionRow[];
  const questionResults = (questionResultsRes.data || []) as { answered_at: string }[];

  const examTaxonomy = taxonomy as unknown as Record<string, Record<string, string[]>>;
  const examSubjects = examTaxonomy[profileRes.data.exam_name];
  const allDomains: string[] = examSubjects
    ? [...new Set(Object.values(examSubjects).flat())]
    : [];

  const masteryMap: Record<string, number> = {};
  const domainAttempted: Record<string, number> = {};
  for (const c of concepts) {
    masteryMap[c.skill_domain] = c.mastery_score;
    domainAttempted[c.skill_domain] = c.total_attempted;
  }

  const readinessIndex = Math.round(
    allDomains.length > 0 ? calculateReadinessIndex(masteryMap, allDomains) : 0
  );

  const domainBreakdown = allDomains.map((domain) => ({
    domain,
    score: masteryMap[domain] ?? 0,
    totalAttempted: domainAttempted[domain] ?? 0,
  }));

  const streak = computeStreak(questionResults);

  const data: AnalyticsPageData = {
    readinessIndex,
    totalQuestions: questionResults.length,
    sessionsCompleted: completedSessionsRes.count ?? 0,
    streak,
    domainBreakdown,
    recentSessions,
    examName: profileRes.data.exam_name,
  };

  return <AnalyticsView data={data} />;
}
