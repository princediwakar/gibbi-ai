import { z } from "zod";
import { safeParseJson } from "../json-repair";
import { GeneratedQuizSchema } from "../schemas/quiz";
import type { GeneratedQuiz } from "../schemas/quiz";

// ----- Response Cleaning -----
export function cleanResponse(text: string): string {
  const idx = text.indexOf("END_OF_JSON");
  if (idx !== -1) text = text.slice(0, idx);
  return text
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/\s*```/gi, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

// ----- Parsing & Validation -----
export function parseQuiz(raw: string, expectedQuestionCount?: number): GeneratedQuiz {
  const cleaned = cleanResponse(raw);
  const parseResult = safeParseJson(cleaned);
  if ("error" in parseResult) {
    throw new Error(`Invalid JSON: ${parseResult.error}`);
  }

  // Validate the parsed quiz against the Zod schema
  const quiz = GeneratedQuizSchema.parse(parseResult.data);

  // Count total questions (standalone + grouped)
  const standaloneCount = quiz.questions?.length || 0;
  const groupedCount = quiz.question_groups?.reduce((sum, group) => sum + (group.questions?.length || 0), 0) || 0;
  const totalQuestions = standaloneCount + groupedCount;

  // Handle question count mismatch by truncating if needed
  if (expectedQuestionCount !== undefined && totalQuestions !== expectedQuestionCount) {
    console.log(`Adjusting question count: Generated ${totalQuestions}, requested ${expectedQuestionCount}`);

    if (totalQuestions > expectedQuestionCount) {
      // Truncate excess questions
      const excess = totalQuestions - expectedQuestionCount;
      console.log(`Truncating ${excess} excess questions`);

      // First truncate from standalone questions
      if (quiz.questions && quiz.questions.length > 0) {
        const standaloneToRemove = Math.min(excess, quiz.questions.length);
        quiz.questions = quiz.questions.slice(0, quiz.questions.length - standaloneToRemove);
        console.log(`Removed ${standaloneToRemove} standalone questions`);
      }

      // If still need to remove more, truncate from question groups
      let remainingToRemove = totalQuestions - expectedQuestionCount - (quiz.questions?.length || 0);
      const groupedCurrent = quiz.question_groups?.reduce((sum, group) => sum + (group.questions?.length || 0), 0) || 0;
      remainingToRemove = Math.min(remainingToRemove, groupedCurrent);

      if (remainingToRemove > 0 && quiz.question_groups) {
        for (let i = quiz.question_groups.length - 1; i >= 0 && remainingToRemove > 0; i--) {
          const group = quiz.question_groups[i];
          if (group.questions && group.questions.length > 0) {
            const toRemoveFromGroup = Math.min(remainingToRemove, group.questions.length);
            group.questions = group.questions.slice(0, group.questions.length - toRemoveFromGroup);
            remainingToRemove -= toRemoveFromGroup;

            // Remove empty groups
            if (group.questions.length === 0) {
              quiz.question_groups.splice(i, 1);
            }
          }
        }
      }
    } else {
      // If we have fewer questions than expected, log a warning but continue
      console.warn(`Generated ${totalQuestions} questions, but ${expectedQuestionCount} were requested. Continuing with available questions.`);
    }
  }

  // Additional validation for question groups
  quiz.question_groups?.forEach((group, idx) => {
    if (!group.questions?.length) {
      throw new Error(`Question group ${idx + 1} (${group.group_id}) has no questions`);
    }
    if (group.questions.length > 4) {
      throw new Error(`Question group ${idx + 1} (${group.group_id}) has too many questions (${group.questions.length}). Maximum is 4 per group.`);
    }
  });

    return quiz;
}

// All exam-specific intelligence is now handled through natural language prompting
// The AI will understand exam context from the user's request and respond appropriately

// ----- Zod Resilience Layer -----

/**
 * Extracts balanced top-level JSON object strings from raw text.
 * Walks the string tracking brace/bracket depth and returns substrings
 * that represent complete { ... } or [ ... ] blocks.
 */
function extractJsonCandidates(raw: string): string[] {
  const candidates: string[] = [];
  let inString = false;
  let escapeNext = false;
  let depth = 0;
  let start = -1;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{' || ch === '[') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 0 && start !== -1) {
        candidates.push(raw.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return candidates;
}

/**
 * Coerces common AI output quirks into schema-compatible types before validation.
 * Returns null if the candidate is fundamentally unusable (missing question_text or options).
 */
function coerceQuestionCandidate(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const obj = { ...(raw as Record<string, unknown>) };

  // question_text: must exist and be a non-empty string
  if (obj.question_text != null && typeof obj.question_text !== "string") {
    obj.question_text = String(obj.question_text);
  }
  if (typeof obj.question_text !== "string" || obj.question_text.trim().length === 0) {
    return null;
  }
  obj.question_text = obj.question_text.trim();

  // options: must exist — coerce array to { A: "...", B: "...", ... }
  if (obj.options == null) return null;

  if (Array.isArray(obj.options)) {
    obj.options = Object.fromEntries(
      (obj.options as unknown[]).map((v, i) => [String.fromCharCode(65 + i), String(v)]),
    );
  }

  if (typeof obj.options !== "object" || obj.options === null || Array.isArray(obj.options)) {
    return null;
  }

  // correct_option: must exist, coerce to uppercase string
  if (obj.correct_option != null && typeof obj.correct_option !== "string") {
    obj.correct_option = String(obj.correct_option);
  }
  if (typeof obj.correct_option === "string") {
    obj.correct_option = obj.correct_option.trim().toUpperCase();
  }

  // explanation: coerce to string
  if (obj.explanation != null && typeof obj.explanation !== "string") {
    obj.explanation = String(obj.explanation);
  }

  // time_estimate_seconds: coerce string → number
  if (typeof obj.time_estimate_seconds === "string") {
    const n = Number(obj.time_estimate_seconds);
    if (!Number.isNaN(n)) obj.time_estimate_seconds = n;
  }

  // topics: wrap single string in array
  if (typeof obj.topics === "string") {
    obj.topics = [obj.topics];
  }

  // misconception: coerce to string
  if (obj.misconception != null && typeof obj.misconception !== "string") {
    obj.misconception = String(obj.misconception);
  }

  // skill_domain: ensure string
  if (obj.skill_domain != null && typeof obj.skill_domain !== "string") {
    obj.skill_domain = String(obj.skill_domain);
  }

  return obj;
}

/**
 * Attempts to extract individual valid questions from a raw LLM response
 * by finding all JSON-like objects and validating each against the schema.
 * Applies type coercion before validation to handle common AI output quirks.
 */
function extractAndValidateQuestions(
  raw: string,
  schema: z.ZodTypeAny,
): unknown[] {
  const cleaned = cleanResponse(raw);
  const candidates = extractJsonCandidates(cleaned);

  const validQuestions: unknown[] = [];

  for (const candidate of candidates) {
    const parseResult = safeParseJson(candidate);
    if ("error" in parseResult) continue;

    const coerced = coerceQuestionCandidate(parseResult.data);
    if (!coerced) continue;

    const validated = schema.safeParse(coerced);
    if (validated.success) {
      validQuestions.push(validated.data);
    }
  }

  return validQuestions;
}

/**
 * Extracts all questions from a parsed result, handling both
 * GeneratedQuiz-like objects (with .questions and .question_groups)
 * and plain question arrays or single question objects.
 */
function collectQuestions(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;

  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;

    // Handle GeneratedQuiz-like shape
    if (Array.isArray(obj.questions) || Array.isArray(obj.question_groups)) {
      const questions: unknown[] = [];

      if (Array.isArray(obj.questions)) {
        questions.push(...(obj.questions as unknown[]));
      }

      if (Array.isArray(obj.question_groups)) {
        for (const group of obj.question_groups as Array<{ questions?: unknown[] }>) {
          if (Array.isArray(group.questions)) {
            questions.push(...group.questions);
          }
        }
      }

      return questions;
    }

    // If it looks like a single question object (has question_text), wrap it
    if (typeof obj.question_text === 'string') {
      return [parsed];
    }
  }

  return [];
}

// ----- DRY Helpers for parseWithRecovery -----

function validateQuestionCandidates(candidates: unknown[], schema: z.ZodTypeAny): unknown[] {
  const result: unknown[] = [];
  for (const c of candidates) {
    const coerced = coerceQuestionCandidate(c);
    if (!coerced) continue;
    const parsed = schema.safeParse(coerced);
    if (parsed.success) result.push(parsed.data);
  }
  return result;
}

function tryParseFullResponse(raw: string, schema: z.ZodTypeAny): unknown[] | null {
  const cleaned = cleanResponse(raw);
  const parsed = safeParseJson(cleaned);
  if ("error" in parsed) return null;
  try {
    const questions = collectQuestions(parsed.data);
    return questions.length > 0 ? validateQuestionCandidates(questions, schema) : null;
  } catch { return null; }
}

export async function parseWithRecovery(
  rawResponse: string,
  schema: z.ZodTypeAny,
  expectedCount: number,
  retryFn: () => Promise<string>,
  retryFn2?: () => Promise<string>,
): Promise<{ questions: unknown[]; recovered: boolean; retried: boolean }> {
  // Attempt 1: Parse the entire response
  const attempt1 = tryParseFullResponse(rawResponse, schema);
  if (attempt1 && attempt1.length > 0) {
    return { questions: attempt1, recovered: false, retried: false };
  }

  // Attempt 1: Extract individual questions from the raw response
  let validQuestions = extractAndValidateQuestions(rawResponse, schema);

  // Any valid question is worth keeping — retrying is risky
  if (validQuestions.length >= 1) {
    return { questions: validQuestions, recovered: true, retried: false };
  }

  // Attempt 2: Retry via the provided retry function
  let retriedRaw: string;
  try {
    retriedRaw = await retryFn();
  } catch {
    // Retry API call failed — nothing we can do, retryFn2 also won't work
    throw new Error(
      `Failed to parse or generate valid questions. Retry API call failed. ` +
      `Expected ${expectedCount}, got 0 valid questions.`,
    );
  }

  // Attempt 2: Try full parse first
  const attempt2Full = tryParseFullResponse(retriedRaw, schema);
  if (attempt2Full && attempt2Full.length > 0) {
    return { questions: attempt2Full, recovered: false, retried: true };
  }

  // Attempt 2: Extract individual questions
  const retriedQuestions = extractAndValidateQuestions(retriedRaw, schema);
  if (retriedQuestions.length > 0) {
    return { questions: retriedQuestions, recovered: true, retried: true };
  }

  // Attempt 3: Second retry with different parameters (if provided)
  if (retryFn2) {
    let retry2Raw: string;
    try {
      retry2Raw = await retryFn2();
    } catch {
      throw new Error(
        `Failed to parse or generate valid questions after 2 retries. ` +
        `Expected ${expectedCount}, got 0 valid questions across all attempts.`,
      );
    }

    // Attempt 3: Try full parse first
    const attempt3Full = tryParseFullResponse(retry2Raw, schema);
    if (attempt3Full && attempt3Full.length > 0) {
      return { questions: attempt3Full, recovered: false, retried: true };
    }

    // Attempt 3: Extract individual questions
    const retry2Questions = extractAndValidateQuestions(retry2Raw, schema);
    if (retry2Questions.length > 0) {
      return { questions: retry2Questions, recovered: true, retried: true };
    }
  }

  throw new Error(
    `Failed to parse or generate valid questions after ${retryFn2 ? "2 retries" : "retry"}. ` +
    `Expected ${expectedCount}, got 0 valid questions across all attempts.`,
  );
}
