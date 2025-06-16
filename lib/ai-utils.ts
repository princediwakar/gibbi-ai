// lib/ai-utils.ts
import { z } from "zod";

// ----- Schemas and Types -----

// Options: either object map or array of strings
export const OptionObjectSchema = z.record(z.string(), z.string());
export const OptionArraySchema = z.array(z.string());
export const OptionSchema = z.union([OptionObjectSchema, OptionArraySchema]).transform((opts) => {
  if (Array.isArray(opts)) {
    return Object.fromEntries(opts.map((val, idx) => [String.fromCharCode(65 + idx), val]));
  }
  return opts;
});

export const QuestionSchema = z.object({
  question_text: z.string(),
  options: OptionSchema,
  correct_option: z.string(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const GraphContentSchema = z.object({
  type: z.enum(["bar", "line", "pie"]),
  title: z.string(),
  labels: z.array(z.string()),
  datasets: z.array(z.object({ label: z.string(), values: z.array(z.number()) })),
});
export const TableContentSchema = z.object({ headers: z.array(z.string()), rows: z.array(z.array(z.string())) });

export const StructuredContentSchema = z.union([GraphContentSchema, TableContentSchema]);

export const SupportingContentSchema = z.object({
  type: z.enum(["text", "image", "graph", "table"]),
  content: z.union([z.string(), StructuredContentSchema]),
  caption: z.string().optional(),
});
export type SupportingContent = z.infer<typeof SupportingContentSchema>;

export const QuestionGroupSchema = z.object({
  supporting_content: SupportingContentSchema,
  questions: z.array(QuestionSchema).min(1),
});
export type QuestionGroup = z.infer<typeof QuestionGroupSchema>;

export const GeneratedQuizSchema = z.object({
  title: z.string().default("Generated Quiz"),
  description: z.string().default(""),
  topic: z.string().default(""),
  subject: z.string().default(""),
  language: z.string().default(""),
  difficulty: z.string().default(""),
  questions: z.array(QuestionSchema).default([]),
  question_groups: z.array(QuestionGroupSchema).default([]),
});
export type GeneratedQuiz = z.infer<typeof GeneratedQuizSchema>;

// ----- Response Cleaning -----
export function cleanResponse(text: string): string {
  const idx = text.indexOf("END_OF_JSON");
  if (idx !== -1) text = text.slice(0, idx);
  return text
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/\s*```/gi, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();
}

// ----- Parsing & Validation -----
export function parseQuiz(raw: string): GeneratedQuiz {
  const cleaned = cleanResponse(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : err}`);
  }
  // parse applies defaults
  const quiz = GeneratedQuizSchema.parse(parsed);
  return quiz;
}

// ----- Variability Instructions -----
const tones = ["Engaging and clear", "Challenging and thought-provoking", "Informative and concise"];
const creativityMods = [
  "Ensure questions cover a range of difficulty and question types.",
  "Incorporate diverse perspectives and applications of the content.",
  "Create questions that test both factual recall and critical thinking.",
];
const qTypes = [
  "Factual knowledge and recall questions.",
  "Analytical questions requiring reasoning or problem-solving.",
  "Application-based questions using real or hypothetical scenarios.",
  "Conceptual understanding and comparison questions.",
];
function pick<T>(arr: T[], rng: () => number) { return arr[Math.floor(rng() * arr.length)]; }
export function getVariabilityInstructions(rng: () => number = Math.random): string {
  return [
    `1. Tone: ${pick(tones, rng)}`,
    `2. ${pick(creativityMods, rng)}`,
    `3. ${pick(qTypes, rng)}`,
    `4. Adapt questions to content type (e.g., math, history).`,
    `5. Ensure specificity to prompt.`,
    `6. Maintain variety; avoid repetition.`,
    `7. Cover unique angles; don't rephrase identical questions.`,
    `8. Identify distinct themes and group questions.`,
    `9. For each theme, create 2-5 related questions.`,
  ].join("\n");
}
// lib/ai-utils.ts

export function buildSystemMessage(
  variability: string,
  language: string,
  difficulty: string,
  remaining: number,
  maxTokens: number
): string {
  const ROLE = "You are an expert Test Generator specializing in standardized tests as of April 2025.";
  const SCHEMA_INSTRUCTIONS = `
Output **must** be a single valid JSON object (no markdown, no extra text) in exactly this shape:

{
  "title": "string",
  "description": "string",
  "topic": "string",
  "subject": "string",
  "language": "${language}",
  "difficulty": "${difficulty}",
  "question_groups": [
    {
      "supporting_content": {
        "type": "text" | "image" | "graph" | "table",
        "content": "string or serialized object",
        "caption": "string (optional)"
      },
      "questions": [
        {
          "question_text": "string",
          "options": { "A": "option1", "B": "option2", /* … */ },
          "correct_option": "A" | "B" | /* … */
        }
      ]
    }
  ],
  "questions": [
    {
      "question_text": "string",
      "options": { "A": "option1", "B": "option2", /* … */ },
      "correct_option": "A" | "B" | /* … */
    }
  ]
}

Append the literal marker `END_OF_JSON` immediately after the closing brace.
`;

  const RULES = [
    `Generate exactly ${remaining} questions.`,
    `Variability rules:\n${variability}`,
    `Fit your JSON within ${maxTokens} tokens.`,
  ].join("\n\n");

  return [ROLE, SCHEMA_INSTRUCTIONS.trim(), RULES].join("\n\n");
}

export function buildUserMessage(
  content: string,
  remaining: number,
  uniqueToken: string
): string {
  return `
Generate a test for the following content:
####
${content}
####

Number of questions: ${remaining}
Unique run token: ${uniqueToken}

Use the above schema exactly. Do not wrap in markdown or add any commentary.
`.trim();
}

// ----- Extraction Helper -----
export function extractValidQuestions(raw: string) {
  const quiz = parseQuiz(raw);
  return { validQuestions: quiz.questions, validQuestionGroups: quiz.question_groups, metadata: quiz };
}
