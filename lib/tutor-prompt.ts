// Path: lib/tutor-prompt.ts
import type { TimeMode } from "@/types/tutor";

// ----- Types -----

export interface TutorPromptParams {
  examName: string;
  examYear: string;
  timeMode: TimeMode;
  daysRemaining: number;
  targetDomains: TargetDomain[];
  questionCount: number;
  difficultyDistribution: { easy: number; medium: number; hard: number };
}

export interface TargetDomain {
  skillDomain: string;
  masteryScore: number;
  recentErrors: string[];
  isOverdue: boolean;
  lastSeenAt: string | null;
}

export interface ConceptMasteryRow {
  skill_domain: string;
  mastery_score: number;
  review_interval_days: number;
  next_review_at: string;
  last_seen_at: string;
  total_attempted: number;
  total_correct: number;
}

// ----- Immutable System Prompt (Cached by DeepSeek) -----
// Must be 100% static — no template literals or dynamic injection.
// DeepSeek caches this across users, reducing input cost from $0.14/M to $0.0028/M.

const TUTOR_SYSTEM_PROMPT = `You are a ruthless, elite competitive exam tutor (JEE, NEET, UPSC, GMAT). You generate multiple-choice questions indistinguishable from real exam papers. 

# QUALITY STANDARDS
1. EXAM AUTHENTICITY: Stems must be unambiguous. standard conventions (SI, IUPAC) are mandatory. 
2. DISTRACTORS: No filler options. Every wrong answer must represent a calculable error, sign mistake, formula misapplication, or conceptual trap.
3. EXPLANATIONS: You must prove the correct answer mathematically/logically AND deconstruct the primary trap.

# OUTPUT INTERFACE
Output ONLY raw JSON matching this schema. No markdown, no preambles.

interface Response {
  questions: Array<{
    question_text: string;
    options: { A: string; B: string; C: string; D: string };
    correct_option: "A" | "B" | "C" | "D";
    explanation: string;
    distractor_analysis: { A: string; B: string; C: string; D: string };
    skill_domain: string; // MUST perfectly match a provided Target Domain
    difficulty_tier: "foundation" | "application" | "advanced" | "expert";
    time_estimate_seconds: number;
    misconception: string; // Exact name of the specific error
    topics: string[]; // 1-2 precise sub-topics
  }>
}

Constraint Checklist & Confidence Score:
1. Is every distractor plausible? Yes.
2. Is the JSON completely bare (no \`\`\`json)? Yes.
3. Do skill domains match the prompt exactly? Yes.`;
const CACHED_PROMPT_LENGTH = TUTOR_SYSTEM_PROMPT.length;

export function getTutorSystemPrompt(): string {
  return TUTOR_SYSTEM_PROMPT;
}

export function getTutorSystemPromptStats(): { length: number } {
  return { length: CACHED_PROMPT_LENGTH };
}

// ----- Dynamic User Message Builder -----

export function buildTutorUserMessage(params: TutorPromptParams): string {
  const {
    examName,
    examYear,
    timeMode,
    daysRemaining,
    targetDomains,
    questionCount,
    difficultyDistribution,
  } = params;

  const domainLines = targetDomains
    .map((d) => formatDomainMasteryLine(d))
    .join("\n");

  // Fix the delusion: align user requests with the system prompt's schema.
  return `CONTEXT: ${examName} ${examYear} | Mode: ${timeMode} | ${daysRemaining} days remaining.

TARGET DOMAINS & MASTERY:
${domainLines}

EXECUTION DIRECTIVE:
Generate exactly ${questionCount} questions with the following tier distribution:
- ${difficultyDistribution.easy} "foundation" tier
- ${difficultyDistribution.medium} "application" tier
- ${difficultyDistribution.hard} "advanced" / "expert" tier

CRITICAL: Do not repeat previous questions. Strictly use the exact TARGET DOMAIN names provided above for the \`skill_domain\` field.`;
}

// ----- Domain Selection (SM-2 Queue) -----

export function selectTargetDomains(
  concepts: ConceptMasteryRow[],
  taxonomyDomains: string[],
  count: number,
): TargetDomain[] {
  const conceptByDomain = new Map<string, ConceptMasteryRow>();
  for (const c of concepts) {
    conceptByDomain.set(c.skill_domain, c);
  }

  const now = new Date().toISOString();

  const candidates: TargetDomain[] = taxonomyDomains.map((domain) => {
    const row = conceptByDomain.get(domain);

    if (row) {
      return {
        skillDomain: domain,
        masteryScore: row.mastery_score,
        recentErrors: [],
        isOverdue: row.next_review_at <= now,
        lastSeenAt: row.last_seen_at,
      };
    }

    return {
      skillDomain: domain,
      masteryScore: 0,
      recentErrors: [],
      isOverdue: true,
      lastSeenAt: null,
    };
  });

  candidates.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    if (a.masteryScore !== b.masteryScore) return a.masteryScore - b.masteryScore;
    const aTs = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
    const bTs = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
    return aTs - bTs;
  });

  return candidates.slice(0, count);
}

// ----- Domain Mastery Line Formatter -----

export function formatDomainMasteryLine(domain: TargetDomain): string {
  const base = `${domain.skillDomain}: ${Number(domain.masteryScore).toFixed(2)}`;
  if (domain.recentErrors.length === 0) {
    return `- ${base} (no recent errors)`;
  }
  const errors = domain.recentErrors.join(", ");
  return `- ${base} (recent errors: ${errors})`;
}

// ----- Difficulty Distribution Calculator -----

// ----- Diagnostic User Message Builder -----

export interface DiagnosticStrata {
  name: string;
  domains: string[];
}

export interface DiagnosticUserMessageParams {
  examName: string;
  examYear: string;
  strata: DiagnosticStrata[];
}

export function buildDiagnosticUserMessage(
  params: DiagnosticUserMessageParams,
): string {
  const { examName, examYear, strata } = params;

  const strataLines = strata
    .map((s) => `- ${s.name}: ${s.domains.join(", ")}`)
    .join("\n");

  return `CONTEXT: ${examName} ${examYear} | Mode: Diagnostic (5 questions)

DIAGNOSTIC STRATA:
${strataLines}

EXECUTION DIRECTIVE:
Generate exactly 5 questions — one per stratum listed above. Each question must:
1. Test fundamental, cross-cutting understanding of the stratum's domain cluster. Do NOT target a single topic within the cluster.
2. Require connecting concepts across at least two domains in the cluster to reach the correct answer.
3. Use the standard conventions for the exam (SI, IUPAC where applicable).
4. Include plausible distractors derived from common errors within that stratum.

CRITICAL: One question per stratum. Output raw JSON matching the schema. Do not repeat questions.`;
}

export function computeDifficultyDistribution(
  questionCount: number,
  timeMode: TimeMode,
): { easy: number; medium: number; hard: number } {
  switch (timeMode) {
    case "foundation": {
      const easy = Math.round(questionCount * 0.3);
      const medium = Math.round(questionCount * 0.5);
      const hard = questionCount - easy - medium;
      return { easy, medium, hard };
    }
    case "acceleration": {
      const easy = Math.round(questionCount * 0.15);
      const medium = Math.round(questionCount * 0.5);
      const hard = questionCount - easy - medium;
      return { easy, medium, hard };
    }
    case "triage": {
      const easy = Math.round(questionCount * 0.1);
      const medium = Math.round(questionCount * 0.4);
      const hard = questionCount - easy - medium;
      return { easy, medium, hard };
    }
  }
}
