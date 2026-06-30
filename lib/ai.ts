// Path: lib/ai.ts
import OpenAI from "openai";
import {
  parseQuiz,
  getVariabilityInstructions,
  buildSystemMessage,
  buildUserMessage,
  GeneratedQuiz,
  generateSessionFingerprint,
} from "./ai-utils";
import { searchCurrentAffairs, formatSearchContext } from "./tavily";

type AIProvider = "openai" | "deepseek";

interface ProviderConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

const PROVIDER: AIProvider = (process.env.AI_PROVIDER as AIProvider) || "deepseek";

const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL || "gpt-4o",
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY!,
    baseURL: process.env.AI_BASE_URL || "https://api.deepseek.com/v1",
    model: process.env.OPENAI_MODEL || "deepseek-v4-pro",
  },
};

const config = PROVIDER_CONFIGS[PROVIDER];
if (!config.apiKey) {
  const keyVar = PROVIDER === "openai" ? "OPENAI_API_KEY" : "DEEPSEEK_API_KEY";
  throw new Error(`Missing ${keyVar}`);
}

export const MODEL = config.model;
const IS_OPENAI = PROVIDER === "openai";

export const openai = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL,
});

const CURRENT_AFFAIRS_KEYWORDS = [
  "latest", "recent", "new", "current", "2024", "2025", "2026",
  "today", "this week", "this month", "this year",
  "news", "breaking", "update", "trending",
  "election", "president", "prime minister", "government",
  "stock market", "economy", "inflation", "recession",
  "tech", "ai", "artificial intelligence", "startup",
  "climate", "weather", "disaster", "conflict", "war",
  "sports", "olympics", "championship", "tournament",
  "award", "grammy", "oscar", "emmy", "academy",
  "product launch", "iphone", "android", "tesla",
  "covid", "pandemic", "vaccine", "health",
  "space", "nasa", "spacex", "moon", "mars",
];

function needsCurrentAffairsSearch(content: string): boolean {
  const lowerContent = content.toLowerCase();
  const hasTimeKeyword = CURRENT_AFFAIRS_KEYWORDS.some(keyword =>
    lowerContent.includes(keyword.toLowerCase())
  );
  const questionPatterns = [
    /what('s| is) new in/i,
    /what happened (recently|lately|this year)/i,
    /latest (news|developments|trends)/i,
    /current (events|situation|state)/i,
    /who won (recently|latest)/i,
    /who is the (current|new)/i,
  ];
  const hasQuestionPattern = questionPatterns.some(pattern => pattern.test(content));
  return hasTimeKeyword || hasQuestionPattern;
}

async function getSearchContext(content: string): Promise<string | null> {
  if (!process.env.TAVILY_API_KEY) {
    console.log('[Tavily] API key not configured, skipping search');
    return null;
  }
  if (!needsCurrentAffairsSearch(content)) {
    console.log('[Tavily] Content does not require current affairs search');
    return null;
  }
  console.log('[Tavily] Detected current affairs topic, searching...');
  const searchResults = await searchCurrentAffairs(content, 5);
  if (!searchResults) {
    console.log('[Tavily] Search failed, continuing without current info');
    return null;
  }
  console.log(`[Tavily] Found ${searchResults.results.length} results in ${searchResults.responseTime}ms`);
  return formatSearchContext(searchResults);
}

const CHUNK_SIZE = 12;

export interface GenerationProgress {
  done: number;
  total: number;
}

export interface ChunkedQuizResult {
  quiz: GeneratedQuiz | null;
  partial: boolean;
  totalGenerated: number;
  totalRequested: number;
}

function buildResponseFormat() {
  if (IS_OPENAI) {
    return {
      type: "json_schema" as const,
      json_schema: {
        name: "quiz",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            topic: { type: "string" },
            subject: { type: "string" },
            language: { type: "string" },
            difficulty: { type: "string" },
            questions: { type: "array", items: { type: "object" } },
            question_groups: { type: "array", items: { type: "object" } },
          },
          required: ["title", "description", "topic", "subject", "language", "difficulty"],
          additionalProperties: false,
        },
      },
    };
  }
  return { type: "json_object" as const };
}

async function generateSingleChunk(
  content: string,
  questionCount: number,
  difficulty: string,
  language: string,
  sessionFingerprint: string,
  searchContext: string | null,
  focusTopics?: string[]
): Promise<GeneratedQuiz> {
  const maxTokens = Math.min(questionCount * 250 + 1000, 8192);
  const variabilityInstructions = await getVariabilityInstructions(sessionFingerprint, difficulty);
  const systemMessage = buildSystemMessage(
    variabilityInstructions, language, difficulty, questionCount, maxTokens,
    focusTopics?.length ? `Focus topics: ${focusTopics.join(", ")}` : undefined
  );
  const messages = [
    { role: "system" as const, content: systemMessage },
    { role: "user" as const, content: buildUserMessage(content, questionCount, crypto.randomUUID(), searchContext) },
  ];

  const response = await openai.chat.completions.create(
    {
      model: MODEL,
      messages,
      temperature: 0.95,
      max_tokens: maxTokens,
      response_format: buildResponseFormat(),
    },
    { signal: undefined }
  );

  const rawResponse = response.choices[0]?.message?.content || "";
  return parseQuiz(rawResponse, questionCount);
}

export async function createQuizWithAI(
  content: string,
  questionCount: number,
  difficulty: string = "Medium",
  language: string = "Auto",
  maxAttempts: number = 3,
  userId?: string,
  onProgress?: (progress: GenerationProgress) => void,
  signal?: AbortSignal,
  focusTopics?: string[]
): Promise<GeneratedQuiz> {
  const sessionFingerprint = await generateSessionFingerprint(content, userId);
  console.log(`[AI] Session Fingerprint: ${sessionFingerprint}`);

  const searchContext = await getSearchContext(content);

  if (signal?.aborted) throw new Error("Aborted");

  if (questionCount <= CHUNK_SIZE) {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (signal?.aborted) {
        lastError = new Error("Aborted");
        break;
      }
      try {
        const quiz = await generateSingleChunk(
          content, questionCount, difficulty, language,
          sessionFingerprint, searchContext, focusTopics
        );
        onProgress?.({ done: questionCount, total: questionCount });
        return quiz;
      } catch (error) {
        lastError = error as Error;
        if (signal?.aborted) break;
        if (attempt < maxAttempts - 1) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.log(`[AI] Retry ${attempt + 1}/${maxAttempts} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError ?? new Error("Failed to generate quiz");
  }

  const chunks: GeneratedQuiz[] = [];
  const chunkSizes = distributeChunks(questionCount, CHUNK_SIZE);
  let failedChunks = 0;

  for (let i = 0; i < chunkSizes.length; i++) {
    if (signal?.aborted) break;

    let chunkResult: GeneratedQuiz | null = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (signal?.aborted) break;
      try {
        chunkResult = await generateSingleChunk(
          content, chunkSizes[i], difficulty, language,
          sessionFingerprint, searchContext, focusTopics
        );
        break;
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          console.error(`[AI] Chunk ${i + 1} failed after ${maxAttempts} attempts`);
          failedChunks++;
        } else {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (chunkResult) {
      chunks.push(chunkResult);
    }

    const totalDone = chunks.reduce((sum, c) => sum + (c.questions?.length ?? 0) + (c.question_groups?.reduce((s, g) => s + (g.questions?.length ?? 0), 0) ?? 0), 0);
    onProgress?.({ done: totalDone, total: questionCount });
  }

  if (chunks.length === 0) {
    throw new Error("All chunks failed to generate");
  }

  const merged = mergeChunks(chunks);
  const total = (merged.questions?.length ?? 0) + (merged.question_groups?.reduce((s, g) => s + (g.questions?.length ?? 0), 0) ?? 0);
  console.log(`[AI] Generated ${total}/${questionCount} questions across ${chunks.length} chunks (${failedChunks} failed)`);

  return merged;
}

export async function createQuizChunked(
  content: string,
  questionCount: number,
  difficulty: string,
  language: string,
  userId?: string,
  onProgress?: (progress: GenerationProgress) => void,
  signal?: AbortSignal,
  focusTopics?: string[]
): Promise<ChunkedQuizResult> {
  try {
    const quiz = await createQuizWithAI(
      content, questionCount, difficulty, language, 3, userId,
      onProgress, signal, focusTopics
    );
    const total = (quiz.questions?.length ?? 0) + (quiz.question_groups?.reduce((s, g) => s + (g.questions?.length ?? 0), 0) ?? 0);
    return { quiz, partial: total < questionCount, totalGenerated: total, totalRequested: questionCount };
  } catch (error) {
    console.error("[AI] Chunked generation failed:", error);
    return { quiz: null, partial: true, totalGenerated: 0, totalRequested: questionCount };
  }
}

function distributeChunks(total: number, chunkSize: number): number[] {
  const chunks: number[] = [];
  let remaining = total;
  while (remaining > 0) {
    const size = Math.min(remaining, chunkSize);
    chunks.push(size);
    remaining -= size;
  }
  return chunks;
}

function mergeChunks(chunks: GeneratedQuiz[]): GeneratedQuiz {
  if (chunks.length === 1) return chunks[0];
  const first = chunks[0];
  const merged: GeneratedQuiz = {
    title: first.title,
    description: first.description,
    topic: first.topic,
    subject: first.subject,
    language: first.language,
    difficulty: first.difficulty,
    questions: [],
    question_groups: [],
  };
  for (const chunk of chunks) {
    if (chunk.questions?.length) merged.questions!.push(...chunk.questions);
    if (chunk.question_groups?.length) merged.question_groups!.push(...chunk.question_groups);
  }
  return merged;
}
