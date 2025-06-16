// lib/ai.ts
import OpenAI from "openai";
import { randomUUID } from "crypto";
import {
  parseQuiz,
  getVariabilityInstructions,
  buildSystemMessage,
  buildUserMessage,
  GeneratedQuiz,
} from "./ai-utils";

const REQUIRED_ENV_VARS = [
  "OPENAI_API_KEY",
  "AI_BASE_URL",
  "OPENAI_MODEL",
];
REQUIRED_ENV_VARS.forEach((n) => {
  if (!process.env[n]) throw new Error(`Missing ${n}`);
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});
const MODEL = process.env.OPENAI_MODEL!;

const MAX_ATTEMPTS = 5;
const BASE_TOKENS = 500;
const TOKENS_PER_Q = 200;
const MODEL_TOKEN_LIMIT = 8000;

function calculateMaxTokens(questionCount: number): number {
  return Math.min(BASE_TOKENS + questionCount * TOKENS_PER_Q, MODEL_TOKEN_LIMIT);
}

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function createQuizWithAI(
  content: string,
  questionCount: number,
  difficulty: string,
  language: string,
  rng: () => number = Math.random
): Promise<GeneratedQuiz> {
  const maxTokens = calculateMaxTokens(questionCount);
  const variability = getVariabilityInstructions(rng);

  // Initialize quiz with defaults
  const questionKeySet = new Set<string>();
  const quiz: Partial<GeneratedQuiz> = {
    title: "Generated Quiz",
    description: "",
    topic: "",
    subject: "",
    language,
    difficulty,
    questions: [],
    question_groups: [],
  };

  let remaining = questionCount;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const token = randomUUID();
    const systemMsg = buildSystemMessage(
      variability,
      language,
      difficulty,
      remaining,
      maxTokens
    );
    const userMsg = buildUserMessage(content, remaining, token);

    let raw: string;

    try {
      const resp = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: userMsg },
        ],
        temperature: 0.9,
        top_p: 0.9,
        max_tokens: maxTokens,
      });
      raw = resp.choices?.[0]?.message?.content || "";
      if (!raw) throw new Error("Empty AI response");
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      await delay(2 ** attempt * 500);
      continue;
    }

    const parsed = parseQuiz(raw);

    // Override defaults if provided
    if (parsed.title) quiz.title = parsed.title;
    if (parsed.description) quiz.description = parsed.description;
    if (parsed.topic) quiz.topic = parsed.topic;
    if (parsed.subject) quiz.subject = parsed.subject;

    // Deduplicate standalone questions
    parsed.questions.forEach((q) => {
      const key = `${q.question_text}|${q.correct_option}`;
      if (!questionKeySet.has(key)) {
        questionKeySet.add(key);
        quiz.questions!.push(q);
      }
    });

    // Append groups
    quiz.question_groups!.push(...parsed.question_groups);

    // Recalculate remaining
    const groupedCount = quiz.question_groups!.reduce(
      (sum, g) => sum + g.questions.length,
      0
    );
    remaining = questionCount - (quiz.questions!.length + groupedCount);
    if (remaining <= 0 || raw.includes("END_OF_JSON")) break;

    await delay(2 ** attempt * 500);
  }

  // Final trim
  const groupedCount = quiz.question_groups!.reduce(
    (sum, g) => sum + g.questions.length,
    0
  );
  const standaloneNeeded = questionCount - groupedCount;
  const finalQuestions = quiz.questions!.slice(0, standaloneNeeded);

  return {
    title: quiz.title!,
    description: quiz.description!,
    topic: quiz.topic!,
    subject: quiz.subject!,
    language: quiz.language!,
    difficulty: quiz.difficulty!,
    questions: finalQuestions,
    question_groups: quiz.question_groups!,
  };
}
