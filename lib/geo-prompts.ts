// Path: lib/geo-prompts.ts

// ----- Immutable System Prompt (Cached by DeepSeek) -----
// Must be 100% static — no template literals or dynamic injection.
// DeepSeek caches this across users, reducing input cost significantly.

const PRACTICE_SYSTEM_PROMPT = `You are an elite exam question writer creating publicly accessible practice content. Your questions are indistinguishable from real exam papers.

# QUALITY STANDARDS
1. EXAM AUTHENTICITY: Questions must match the exact style, difficulty, and conventions of the specified exam. Use standard notation (SI, IUPAC).
2. DISTRACTORS: Every wrong answer must represent a specific, calculable student error (sign mistake, formula misapplication, conceptual trap). No filler.
3. EXPLANATIONS: Prove the correct answer. Deconstruct each distractor — explain exactly what error leads to each wrong choice.
4. SELF-CONTAINED: Explanations must be complete and standalone — assume the reader found this page via Google search and has no other context.

# OUTPUT INTERFACE
Output ONLY raw JSON matching this schema. No markdown, no preambles.

interface Response {
  questions: Array<{
    question_text: string;
    options: { A: string; B: string; C: string; D: string };
    correct_option: "A" | "B" | "C" | "D";
    distractor_analysis: { A: string; B: string; C: string; D: string };
    skill_domain: string; // MUST exactly match the domain specified in the prompt
    difficulty_tier: "foundation" | "application" | "advanced" | "expert";
    time_estimate_seconds: number;
    misconception: string; // The specific error being tested
    topics: string[]; // 1-2 precise sub-topics within the domain
  }>
}`;

export function getPracticeSystemPrompt(): string {
  return PRACTICE_SYSTEM_PROMPT;
}

export function buildPracticeUserMessage(
  examName: string,
  subject: string,
  domain: string,
  questionCount: number = 3,
): string {
  return `Generate exactly ${questionCount} authentic ${examName} exam practice questions for the domain "${domain}" under the subject "${subject}".

REQUIREMENTS:
- Each question must test a different sub-topic within ${domain}
- Mix difficulty tiers: 1 foundation, 1 application, 1 advanced/expert
- All distractors must be plausible errors a real student would make
- Skill domain for ALL questions must be exactly "${domain}"
- Use the exact conventions, notation, and question style of ${examName}

CRITICAL: Do not repeat questions. Strictly use "${domain}" as the skill_domain field value for every question.`;
}

export interface PracticeDomainEntry {
  exam: string;
  subject: string;
  domain: string;
}

/**
 * Flattens the taxonomy JSON into an array of PracticeDomainEntry.
 * The taxonomy shape is: { _schema_version, [exam]: { [subject]: string[] } }
 */
export function flattenTaxonomy(taxonomy: Record<string, unknown>): PracticeDomainEntry[] {
  const entries: PracticeDomainEntry[] = [];

  for (const [exam, subjects] of Object.entries(taxonomy)) {
    if (exam === "_schema_version") continue;
    if (!subjects || typeof subjects !== "object") continue;

    for (const [subject, domains] of Object.entries(subjects as Record<string, unknown>)) {
      if (!Array.isArray(domains)) continue;
      for (const domain of domains) {
        entries.push({ exam, subject, domain });
      }
    }
  }

  return entries;
}
