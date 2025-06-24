// lib/ai.ts
import OpenAI from "openai";
import {
  parseQuiz,
  getVariabilityInstructions,
  buildSystemMessage,
  buildUserMessage,
  GeneratedQuiz,
  GeneratedQuizSchema,
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

const TOKENS_PER_Q = 200;
const MODEL_TOKEN_LIMIT = 8000;

function calculateMaxTokens(questionCount: number): number {
  return Math.min(MODEL_TOKEN_LIMIT, questionCount * TOKENS_PER_Q);
}

export async function createQuizWithAI(
  content: string,
  questionCount: number,
  difficulty: string = "Medium",
  language: string = "Auto",
  maxAttempts: number = 3
): Promise<GeneratedQuiz> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    try {
      const uniqueToken = crypto.randomUUID();
      const temperature = attempts === 1 ? 0.9 : 0.5; // Start creative, get more focused in retries
      const maxTokens = 4000;
      
      const variabilityInstructions = getVariabilityInstructions();
      const systemMessage = buildSystemMessage(
        variabilityInstructions,
        language,
        difficulty,
        questionCount,
        maxTokens
      );

      const messages = [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: buildUserMessage(content, questionCount, uniqueToken)
        }
      ];

      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: messages as any,
        temperature,
        max_tokens: maxTokens,
      });

      const rawResponse = response.choices[0]?.message?.content || "";
      return parseQuiz(rawResponse);
    } catch (error) {
      console.error(`Retry attempt ${attempts} failed:`, error);
      
      if (attempts === maxAttempts) {
        throw new Error(`Failed to generate quiz with correct number of questions after ${maxAttempts} attempts`);
      }
    }
  }

  throw new Error("Failed to generate quiz after all attempts");
}
