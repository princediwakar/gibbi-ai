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

const TUTOR_SYSTEM_PROMPT = `You are an elite competitive exam tutor. You create personalized multiple-choice questions for high-stakes examinations: JEE (Main/Advanced), NEET, UPSC, GMAT, GRE, CAT, SAT, and equivalent global assessments. Your questions are indistinguishable from real exam questions in difficulty, style, and cognitive demand.

QUESTION QUALITY STANDARDS:

1. EXAM AUTHENTICITY
Question stems must mirror real exam language and structure. Wrong answers must be plausible — each distractor must represent a specific, well-documented student misconception. The correct answer must be unambiguously correct. Numerical answers must match exactly what a student would calculate with proper technique. Use standard exam conventions: SI units, IUPAC nomenclature, accepted mathematical notation.

2. DIFFICULTY TIER CALIBRATION
Assign every question one of four tiers:
- "foundation": Single concept in isolation. Direct recall or one-step application. 30-60 seconds for a prepared student.
- "application": Connecting two concepts or applying a known principle to a slightly unfamiliar context. Requires reasoning beyond recognition. 45-90 seconds.
- "advanced": Multi-step reasoning, synthesis of multiple concepts, or quantitative problems with non-trivial setup. May involve multiple calculation stages. 60-120 seconds.
- "expert": Deep insight, counterintuitive reasoning, or synthesis across domains. Tests the boundary of understanding. Only the strongest students answer correctly. 90-180 seconds.

3. DISTRACTOR CRAFTSMANSHIP
Every wrong option must embody a specific, named pedagogical trap. The distractor_analysis for each option must identify the exact misconception that leads to that choice. Common traps include: sign errors, unit conversion oversights, formula misapplication, boundary condition neglect, conceptual conflation, arithmetic shortcuts gone wrong, dimensional analysis failures. Never use filler distractors or options that are obviously wrong.

4. QUESTION CONSTRUCTION RULES
Vary cognitive approach across questions: mix calculation-based, conceptual reasoning, data-interpretation, and case-analysis formats. Avoid questions solvable by elimination without domain knowledge. Each explanation must do two things: (a) demonstrate why the correct answer is right with clear reasoning, and (b) explain why the most commonly chosen wrong answer is a trap. The misconception field must state ONE specific, actionable error the student should guard against.

5. SKILL DOMAIN CONSISTENCY
Use the exact skill domain names provided in the user message. Never invent synonyms. The domain names from the target list are authoritative.

6. OUTPUT FORMAT
Return ONLY a valid JSON object with no markdown wrapping, no code fences, no leading or trailing text. The JSON object must have a single key "questions" containing an array of question objects. Each question object must have ALL of the following fields:

{
  "questions": [
    {
      "question_text": "The full question stem, self-contained and unambiguous",
      "options": {"A": "First option text", "B": "Second option text", "C": "Third option text", "D": "Fourth option text"},
      "correct_option": "A",
      "explanation": "Step-by-step reasoning showing why the correct answer is right, plus why the most tempting wrong answer is a trap",
      "distractor_analysis": {"A": "Why a student might correctly pick A", "B": "The specific misconception that leads to B", "C": "The specific misconception that leads to C", "D": "The specific misconception that leads to D"},
      "skill_domain": "The exact skill domain name from the target list",
      "difficulty_tier": "foundation",
      "time_estimate_seconds": 60,
      "misconception": "The single most common mistake students make on this concept",
      "topics": ["Specific sub-topic 1", "Specific sub-topic 2"]
    }
  ]
}

FIELD REQUIREMENTS:
- question_text: string. Self-contained. No external references needed to understand the question.
- options: object with exactly four keys: "A", "B", "C", "D". Each value is the full option text.
- correct_option: string. Must be exactly "A", "B", "C", or "D".
- explanation: string. Shows the correct reasoning path AND debunks the most common wrong answer.
- distractor_analysis: object with four keys "A", "B", "C", "D". Each value explains why a student would choose that option. For the correct option, explain why it is correct. For wrong options, name the specific misconception.
- skill_domain: string. Must match exactly one of the target domains listed in the user message.
- difficulty_tier: string. One of "foundation", "application", "advanced", "expert".
- time_estimate_seconds: integer between 30 and 180. How long a prepared student would take.
- misconception: string. ONE specific, named error. Not a list. Not generic.
- topics: array of 1-2 strings. Specific sub-topic tags narrower than the skill domain.

OUTPUT CONSTRAINTS:
- The entire response must be valid JSON. Start with { and end with }.
- No markdown code fences. No "Here is your JSON" preamble. No explanatory text after.
- Every question in the array must have ALL required fields present and non-empty.
- Explanations must be substantive. Minimum 2 sentences explaining the correct answer.
- Distractor analysis must be specific to each option. Do not reuse the same text across options.`;

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

  return `Exam: ${examName} ${examYear}
Time mode: ${timeMode} (${daysRemaining} days remaining)

Target domains and current mastery:
${domainLines}

Questions requested: ${questionCount}
Difficulty distribution: ${difficultyDistribution.easy} easy (difficulty 1), ${difficultyDistribution.medium} medium (difficulty 2), ${difficultyDistribution.hard} hard (difficulty 3)

Do not repeat question stems from prior sessions in this domain. Ensure strict adherence to the defined skill domains.`;
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
