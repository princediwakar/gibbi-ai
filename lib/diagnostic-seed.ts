// Path: lib/diagnostic-seed.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateReadinessIndex } from "@/lib/sm2";
import { TUTOR_CONFIG } from "@/lib/constants/tutor";
import taxonomy from "@/lib/taxonomies.json";

// ----- Types -----

interface QuestionResult {
  skill_domain: string;
  is_correct: boolean;
  time_to_answer_ms: number;
  time_estimate_seconds: number;
}

export interface SeedDiagnosticParams {
  userId: string;
  examProfileId: string;
  sessionId: string;
  examName: string;
  questionResults: QuestionResult[];
}

export interface DiagnosticStrata {
  name: string;
  domains: string[];
}

interface MasteryUpsertRow {
  user_id: string;
  exam_profile_id: string;
  skill_domain: string;
  mastery_score: number;
  total_attempted: number;
  total_correct: number;
  streak: number;
  review_interval_days: number;
  review_ease_factor: number;
  next_review_at: string;
  last_seen_at: string;
}

// ----- Diagnostic Strata -----

const DIAGNOSTIC_STRATA: DiagnosticStrata[] = [
  {
    name: "Foundational Math",
    domains: [
      "Algebra",
      "Trigonometry",
      "Calculus",
      "Complex Numbers",
      "Matrices and Determinants",
    ],
  },
  {
    name: "Mechanics Core",
    domains: [
      "Kinematics",
      "Laws of Motion",
      "Work, Energy and Power",
      "Rotational Motion",
      "Gravitation",
    ],
  },
  {
    name: "Conceptual Reasoning",
    domains: [
      "Electrostatics",
      "Current Electricity",
      "Magnetism and Matter",
      "Thermodynamics",
    ],
  },
  {
    name: "Symbolic Manipulation",
    domains: [
      "Atomic Structure",
      "Chemical Bonding",
      "Equilibrium",
      "Redox Reactions",
    ],
  },
  {
    name: "Integrative Thinking",
    domains: [
      "Modern Physics",
      "Coordination Compounds",
      "Organic Chemistry",
      "Biomolecules",
    ],
  },
];

// Reverse lookup: domain name → stratum name
const DOMAIN_TO_STRATUM: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const stratum of DIAGNOSTIC_STRATA) {
    for (const domain of stratum.domains) {
      map[domain] = stratum.name;
    }
  }
  return map;
})();

// ----- Exported Accessors -----

export function getDiagnosticStrata(): DiagnosticStrata[] {
  return DIAGNOSTIC_STRATA;
}

export function getStratumForDomain(domain: string): string | null {
  return DOMAIN_TO_STRATUM[domain] ?? null;
}

// ----- Scoring Constants -----

const SCORE_WRONG = 0.3;
const SCORE_SLOW_CORRECT = 0.45;
const SCORE_FAST_CORRECT = 0.6;
const SCORE_UNTESTED = 0.5;
const JITTER_RANGE = 0.03;

// ----- Taxonomy Helpers -----

type TaxonomyData = Record<string, Record<string, string[]>>;
const taxonomyData = taxonomy as unknown as TaxonomyData;

function getTaxonomyDomains(examName: string): string[] {
  const examSubjects = taxonomyData[examName] ?? {};
  const domains: string[] = [];
  const seen = new Set<string>();

  for (const subjects of Object.values(examSubjects)) {
    for (const domain of subjects) {
      // Normalize: skip generic subject-level entries that aren't real domains
      const normalized = domain.trim();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      domains.push(normalized);
    }
  }

  return domains;
}

// ----- Jitter -----

function applyJitter(score: number): number {
  const jitter = (Math.random() - 0.5) * 2 * JITTER_RANGE;
  const raw = score + jitter;
  return Math.round(Math.max(0, Math.min(1, raw)) * 10000) / 10000;
}

// ----- Core Seed Logic -----

export async function seedDiagnosticPriors(
  params: SeedDiagnosticParams,
): Promise<{ masteryRows: MasteryUpsertRow[]; readinessIndex: number }> {
  const { userId, examProfileId, sessionId, examName, questionResults } =
    params;

  // 1. Fetch existing mastery rows for this profile
  const { data: existingMastery } = await supabaseAdmin
    .from("concept_mastery")
    .select("skill_domain, mastery_score")
    .eq("user_id", userId)
    .eq("exam_profile_id", examProfileId);

  const existingScoreByDomain = new Map<string, number>();
  if (existingMastery) {
    for (const row of existingMastery) {
      existingScoreByDomain.set(row.skill_domain, row.mastery_score);
    }
  }

  // 2. Determine per-stratum score from question results
  //    If multiple questions land in the same stratum, take the best outcome.
  const stratumScore = new Map<string, number>();

  for (const qr of questionResults) {
    const stratumName = getStratumForDomain(qr.skill_domain);
    if (!stratumName) continue;

    let score: number;
    if (!qr.is_correct) {
      score = SCORE_WRONG;
    } else if (qr.time_to_answer_ms > qr.time_estimate_seconds * 1000) {
      score = SCORE_SLOW_CORRECT;
    } else {
      score = SCORE_FAST_CORRECT;
    }

    const current = stratumScore.get(stratumName);
    if (current === undefined || score > current) {
      stratumScore.set(stratumName, score);
    }
  }

  // 3. Build mastery upsert rows for all domains in the exam's taxonomy
  const taxonomyDomains = getTaxonomyDomains(examName);
  const now = new Date().toISOString();
  const masteryRows: MasteryUpsertRow[] = [];
  const finalScores: Record<string, number> = {};

  for (const domain of taxonomyDomains) {
    const stratumName = getStratumForDomain(domain);
    const stratumScoreValue = stratumName
      ? stratumScore.get(stratumName) ?? null
      : null;

    let baseScore: number;
    if (stratumScoreValue !== null) {
      baseScore = stratumScoreValue;
    } else if (existingScoreByDomain.has(domain)) {
      // Preserve existing score for domains outside the diagnostic strata
      baseScore = existingScoreByDomain.get(domain)!;
    } else {
      // Untested: neutral prior
      baseScore = SCORE_UNTESTED;
    }

    const finalScore = applyJitter(baseScore);
    finalScores[domain] = finalScore;

    masteryRows.push({
      user_id: userId,
      exam_profile_id: examProfileId,
      skill_domain: domain,
      mastery_score: finalScore,
      total_attempted: 0,
      total_correct: 0,
      streak: 0,
      review_interval_days: TUTOR_CONFIG.SM2_DEFAULTS.initial_interval_days,
      review_ease_factor: TUTOR_CONFIG.SM2_DEFAULTS.initial_ease_factor,
      next_review_at: now,
      last_seen_at: now,
    });
  }

  // 4. Upsert concept_mastery rows
  const { error: upsertError } = await supabaseAdmin
    .from("concept_mastery")
    .upsert(masteryRows, {
      onConflict: "user_id, exam_profile_id, skill_domain",
    });

  if (upsertError) {
    console.error(
      "[seedDiagnosticPriors] Mastery upsert error:",
      upsertError,
    );
    throw new Error("Failed to seed diagnostic mastery priors.");
  }

  // 5. Insert mastery_history rows for tracked domains only
  const historyRows = masteryRows.map((row) => ({
    user_id: row.user_id,
    exam_profile_id: row.exam_profile_id,
    skill_domain: row.skill_domain,
    mastery_score: row.mastery_score,
    recorded_at: now,
  }));

  const { error: historyError } = await supabaseAdmin
    .from("mastery_history")
    .insert(historyRows);

  if (historyError) {
    console.error(
      "[seedDiagnosticPriors] History insert error:",
      historyError,
    );
    // Non-fatal: mastery rows are already persisted
  }

  // 6. Compute readiness index
  const readinessIndex = calculateReadinessIndex(finalScores, taxonomyDomains);

  return { masteryRows, readinessIndex };
}
