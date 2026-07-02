// Path: app/dashboard/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TUTOR_ROUTES } from "@/lib/constants/tutor";
import { calculateWeightedReadinessIndex, getTimeMode } from "@/lib/sm2";
import { DashboardView, DashboardViewLoading } from "@/components/tutor/DashboardView";
import type { ExamProfile, ConceptMastery, TimeMode } from "@/types/tutor";
import taxonomy from "@/lib/taxonomies.json";

interface SessionRow {
  id: string;
  user_id: string;
  exam_profile_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  target_domains: string[];
}

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
  directive: string;
  domainBreakdown: { domain: string; score: number; totalAttempted: number }[];
  activeSessions: { id: string; created_at: string }[];
  recentSessions: { id: string; status: string; created_at: string; completed_at: string | null; target_domains: string[] }[];
  quickStats: {
    totalQuestions: number;
    streak: number;
    sessionsCompleted: number;
  };
  examName: string;
  profileId: string;
  activeTargets: string[];
  overdueDomainCount: number;
  customMockCountToday: number;
}

function computeDirective(concepts: ConceptRow[], daysRemaining: number): string {
  const overdue = concepts.filter((c) => new Date(c.next_review_at) < new Date());
  const weak = concepts.filter((c) => c.mastery_score < 0.4);

  if (overdue.length > 0) {
    const subjects = [...new Set(overdue.map((c) => c.skill_domain))];
    const subjectLabel = subjects.slice(0, 2).join(" & ");
    return `Your Focus Today: ${subjectLabel}`;
  }
  if (weak.length > 0) {
    const subjects = [...new Set(weak.map((c) => c.skill_domain))];
    const subjectLabel = subjects.slice(0, 2).join(" & ");
    return `Strengthen Your Understanding: ${subjectLabel}`;
  }
  if (daysRemaining < 30) {
    return "Your Focus Today: High-Yield Topics";
  }
  return "Your Focus Today: Stay Sharp";
}

function computeStreak(questionResults: { answered_at: string }[]): number {
  if (questionResults.length === 0) return 0;

  const activityDays = new Set(
    questionResults.map((r) => new Date(r.answered_at).toISOString().split("T")[0])
  );
  const sorted = [...activityDays].sort().reverse();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.abs(diffDays - 1) < 0.01) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
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
  // Step 1: Check for an active diagnostic session
  const { data: diagnosticSession } = await supabase
    .from("sessions")
    .select("id, status, session_intent")
    .eq("user_id", user.id)
    .eq("session_intent", "diagnostic")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Step 2: Check concept_mastery count
  const { count: conceptCount } = await supabase
    .from("concept_mastery")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Step 3: Force redirect to active diagnostic session if one exists
  if (diagnosticSession) {
    redirect(TUTOR_ROUTES.SESSION(diagnosticSession.id));
  }

  // Step 4: If no concept_mastery rows AND no diagnostic session, redirect to setup
  if ((conceptCount ?? 0) === 0) {
    redirect(TUTOR_ROUTES.SETUP);
  }

  // --- Fetch all dashboard data in parallel ---
  const [
    profileRes,
    conceptsRes,
    activeSessionsRes,
    recentSessionsRes,
    questionResultsRes,
    completedSessionsRes,
    customMockTodayRes,
    overdueCountRes,
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
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("sessions")
      .select("id, status, created_at, completed_at, target_domains")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
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
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("session_intent", "custom_mock")
      .gte("created_at", new Date().toISOString().slice(0, 10)),
    supabase
      .from("concept_mastery")
      .select("id")
      .eq("user_id", user.id)
      .lt("next_review_at", new Date().toISOString()),
  ]);

  if (profileRes.error || !profileRes.data) {
    redirect(TUTOR_ROUTES.SETUP);
  }

  const profile = profileRes.data as ExamProfile;
  const concepts = (conceptsRes.data || []) as ConceptRow[];
  const activeSessions = (activeSessionsRes.data || []) as { id: string; created_at: string }[];
  const recentSessions = (recentSessionsRes.data || []) as SessionRow[];
  const questionResults = (questionResultsRes.data || []) as { answered_at: string }[];

  const customMockCountToday = customMockTodayRes.count ?? 0;
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

  const directive = computeDirective(concepts, daysRemaining);

  const domainBreakdown = allDomains.map((domain) => ({
    domain,
    score: masteryMap[domain] ?? 0,
    totalAttempted: domainAttempted[domain] ?? 0,
  }));

  const streak = computeStreak(questionResults);
  const sessionsCompleted = completedSessionsRes.count ?? 0;

  const data: DashboardPageData = {
    readinessIndex,
    daysRemaining,
    timeMode,
    directive,
    domainBreakdown,
    activeSessions,
    recentSessions,
    quickStats: {
      totalQuestions: questionResults.length,
      streak,
      sessionsCompleted,
    },
    examName: profile.exam_name,
    profileId: profile.profile_id,
    activeTargets: profile.active_targets ?? [],
    overdueDomainCount,
    customMockCountToday,
  };

  return <DashboardView data={data} />;
}
