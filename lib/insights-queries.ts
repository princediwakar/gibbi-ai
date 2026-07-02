// Path: lib/insights-queries.ts

import { supabaseAdmin } from "@/lib/supabase/admin";
import taxonomies from "@/lib/taxonomies.json";

export interface FailedConcept {
  skill_domain: string;
  total_attempts: number;
  total_correct: number;
  failure_rate: number;
}

export interface HardTopic {
  skill_domain: string;
  total_attempts: number;
  total_correct: number;
  avg_time_spent_ms: number;
  incorrect_rate: number;
}

type TaxonomyData = Record<string, Record<string, string[]>>;
const taxonomyData = taxonomies as unknown as TaxonomyData;

export async function getInsightsExams(): Promise<string[]> {
  const { data: answerProfiles } = await supabaseAdmin
    .from("session_answers")
    .select("exam_profile_id");

  if (!answerProfiles || answerProfiles.length === 0) return [];

  const profileIds = [...new Set(answerProfiles.map((a) => a.exam_profile_id))];

  const { data: profiles } = await supabaseAdmin
    .from("exam_profiles")
    .select("exam_name")
    .in("profile_id", profileIds)
    .eq("is_active", true);

  if (!profiles) return [];
  return [...new Set(profiles.map((p) => p.exam_name))].sort();
}

export async function getMostFailedConcepts(
  examName: string
): Promise<FailedConcept[]> {
  const { data: profiles } = await supabaseAdmin
    .from("exam_profiles")
    .select("profile_id")
    .eq("exam_name", examName);

  if (!profiles || profiles.length === 0) return [];

  const profileIds = profiles.map((p) => p.profile_id);

  const { data: answers } = await supabaseAdmin
    .from("session_answers")
    .select("skill_domain, is_correct")
    .in("exam_profile_id", profileIds);

  if (!answers) return [];

  const domainStats = new Map<string, { total: number; correct: number }>();
  for (const a of answers) {
    const existing = domainStats.get(a.skill_domain) || { total: 0, correct: 0 };
    existing.total++;
    if (a.is_correct) existing.correct++;
    domainStats.set(a.skill_domain, existing);
  }

  const results: FailedConcept[] = [];
  for (const [domain, stats] of domainStats) {
    if (stats.total >= 10) {
      results.push({
        skill_domain: domain,
        total_attempts: stats.total,
        total_correct: stats.correct,
        failure_rate:
          Math.round((1 - stats.correct / stats.total) * 1000) / 10,
      });
    }
  }

  results.sort((a, b) => b.failure_rate - a.failure_rate);
  return results.slice(0, 20);
}

export async function getHardestTopics(
  examName: string
): Promise<HardTopic[]> {
  const { data: profiles } = await supabaseAdmin
    .from("exam_profiles")
    .select("profile_id")
    .eq("exam_name", examName);

  if (!profiles || profiles.length === 0) return [];

  const profileIds = profiles.map((p) => p.profile_id);

  const { data: answers } = await supabaseAdmin
    .from("session_answers")
    .select("skill_domain, is_correct, time_to_answer_ms")
    .in("exam_profile_id", profileIds);

  if (!answers) return [];

  const domainStats = new Map<
    string,
    { total: number; correct: number; totalTime: number }
  >();
  for (const a of answers) {
    const existing = domainStats.get(a.skill_domain) || {
      total: 0,
      correct: 0,
      totalTime: 0,
    };
    existing.total++;
    if (a.is_correct) existing.correct++;
    existing.totalTime += a.time_to_answer_ms || 0;
    domainStats.set(a.skill_domain, existing);
  }

  const results: HardTopic[] = [];
  for (const [domain, stats] of domainStats) {
    if (stats.total >= 10) {
      results.push({
        skill_domain: domain,
        total_attempts: stats.total,
        total_correct: stats.correct,
        avg_time_spent_ms: Math.round(stats.totalTime / stats.total),
        incorrect_rate:
          Math.round((1 - stats.correct / stats.total) * 1000) / 10,
      });
    }
  }

  results.sort((a, b) => b.incorrect_rate - a.incorrect_rate);
  return results.slice(0, 20);
}

export async function getTotalPracticeSessions(
  examName: string
): Promise<number> {
  const { data: profiles } = await supabaseAdmin
    .from("exam_profiles")
    .select("profile_id")
    .eq("exam_name", examName);

  if (!profiles || profiles.length === 0) return 0;

  const profileIds = profiles.map((p) => p.profile_id);

  const { count, error } = await supabaseAdmin
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .in("exam_profile_id", profileIds);

  if (error) return 0;
  return count ?? 0;
}

export function getDomainSubject(
  examName: string,
  domain: string
): string | null {
  const examSubjects = taxonomyData[examName];
  if (!examSubjects) return null;
  for (const [subject, domains] of Object.entries(examSubjects)) {
    if (domains.includes(domain)) return subject;
  }
  return null;
}
