// Path: lib/sm2.ts

import { PREREQUISITE_WEIGHTS } from '@/lib/constants/tutor';

type TimeMode = 'foundation' | 'acceleration' | 'triage';

interface SM2State {
  masteryScore: number;
  easeFactor: number;
  intervalDays: number;
  streak: number;
}

interface SM2Result {
  masteryScore: number;
  easeFactor: number;
  intervalDays: number;
  streak: number;
  nextReviewAt: Date;
}

const MIN_EASE_FACTOR = 1.3;
const MASTERY_BLEND_WEIGHT = 0.2;
const DIFFICULTY_DISTRIBUTIONS: Record<TimeMode, { easy: number; medium: number; hard: number }> = {
  foundation: { easy: 5, medium: 4, hard: 1 },
  acceleration: { easy: 3, medium: 5, hard: 2 },
  triage: { easy: 1, medium: 4, hard: 5 },
};

export function gradeQuality(correct: boolean, timeMs: number, timeEstimateSec: number): number {
  const estimateMs = timeEstimateSec * 1000;
  const ratio = timeMs / estimateMs;

  if (correct) {
    if (ratio <= 0.5) return 5;
    if (ratio <= 1.0) return 4;
    if (ratio <= 1.5) return 3;
    return 2;
  }

  if (ratio <= 0.5) return 1;
  return 0;
}

export function calculateEaseFactor(oldEF: number, quality: number): number {
  const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const newEF = oldEF + delta;
  return newEF < MIN_EASE_FACTOR ? MIN_EASE_FACTOR : newEF;
}

export function calculateInterval(oldInterval: number, easeFactor: number, streak: number): number {
  if (streak === 1) return 1;
  if (streak === 2) return 6;
  return Math.ceil(oldInterval * easeFactor);
}

export function calculateMastery(oldMastery: number, quality: number): number {
  return oldMastery * (1 - MASTERY_BLEND_WEIGHT) + MASTERY_BLEND_WEIGHT * (quality / 5);
}

export function updateSM2(state: SM2State, quality: number): SM2Result {
  const easeFactor = calculateEaseFactor(state.easeFactor, quality);
  const streak = quality >= 2 ? state.streak + 1 : 0;
  const intervalDays = calculateInterval(state.intervalDays, easeFactor, streak);
  const masteryScore = calculateMastery(state.masteryScore, quality);
  const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

  return { masteryScore, easeFactor, intervalDays, streak, nextReviewAt };
}

export function calculateReadinessIndex(
  masteryScores: Record<string, number>,
  taxonomyDomains: string[],
  priors?: Record<string, number>,
): number {
  const defaultPrior = 0.25;
  let sum = 0;

  for (const domain of taxonomyDomains) {
    if (domain in masteryScores) {
      sum += masteryScores[domain];
    } else if (priors && domain in priors) {
      sum += priors[domain];
    } else {
      sum += defaultPrior;
    }
  }

  return (sum / taxonomyDomains.length) * 100;
}

export function getTimeMode(daysRemaining: number): TimeMode {
  if (daysRemaining > 90) return 'foundation';
  if (daysRemaining >= 30) return 'acceleration';
  return 'triage';
}

export function getDifficultyDistribution(timeMode: TimeMode): { easy: number; medium: number; hard: number } {
  return { ...DIFFICULTY_DISTRIBUTIONS[timeMode] };
}

// ----- Anti-Gaming Guardrails -----

export async function getManualAttemptsToday(
  userId: string,
  supabase: any,
): Promise<Map<string, number>> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('target_domains')
    .eq('user_id', userId)
    .in('session_intent', ['active_target', 'custom_mock'])
    .gt('created_at', twentyFourHoursAgo);

  if (error || !sessions) {
    console.warn('Failed to fetch manual attempts:', error?.message ?? 'no data');
    return new Map();
  }

  const countMap = new Map<string, number>();
  for (const session of sessions) {
    const domains: string[] = session.target_domains ?? [];
    if (Array.isArray(domains)) {
      for (const domain of domains) {
        countMap.set(domain, (countMap.get(domain) ?? 0) + 1);
      }
    }
  }

  return countMap;
}

export function applyLogarithmicDecay(delta: number, manualCount: number): number {
  if (manualCount > 1) return delta / manualCount;
  return delta;
}

export function computeEarlyReviewPush(
  score: number,
  currentNextReview: Date,
): number | null {
  if (score !== 1.0) return null;

  const now = new Date();
  const daysUntilReview =
    (currentNextReview.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);

  if (daysUntilReview >= 4) return 14;
  return null;
}

export function calculateWeightedReadinessIndex(
  masteryScores: Record<string, number>,
  taxonomyDomains: string[],
  weights?: Record<string, number>,
): number {
  let weightedSum = 0;
  let weightSum = 0;

  for (const domain of taxonomyDomains) {
    const weight =
      weights?.[domain] ??
      PREREQUISITE_WEIGHTS[domain] ??
      1.0;
    const score = masteryScores[domain] ?? 0;

    weightedSum += score * weight;
    weightSum += weight;
  }

  if (weightSum === 0) return 0;
  return (weightedSum / weightSum) * 100;
}
