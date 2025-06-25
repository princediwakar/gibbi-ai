// lib/ai.ts
import OpenAI from "openai";
import {
  parseQuiz,
  getVariabilityInstructions,
  buildSystemMessage,
  buildUserMessage,
  GeneratedQuiz,
  generateSessionFingerprint,
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

// Note: These constants are kept for future token management features
// const TOKENS_PER_Q = 200;
// const MODEL_TOKEN_LIMIT = 8000;

export async function createQuizWithAI(
  content: string,
  questionCount: number,
  difficulty: string = "Medium",
  language: string = "Auto",
  maxAttempts: number = 3,
  userId?: string
): Promise<GeneratedQuiz> {
  let attempts = 0;
  
  // Generate unique session fingerprint for this quiz generation
  const sessionFingerprint = generateSessionFingerprint(content, userId);
  console.log(`🎯 Session Fingerprint: ${sessionFingerprint}`);
  
  while (attempts < maxAttempts) {
    attempts++;
    try {
      const uniqueToken = crypto.randomUUID();
      // Higher temperature for more creative, varied outputs
      const temperature = 0.95;
      const maxTokens = 4000;
      
      // Get session-aware variability instructions
      const variabilityInstructions = getVariabilityInstructions(
        sessionFingerprint, 
        difficulty,
        userId
      );
      
      console.log(`📋 Variability Context:\n${variabilityInstructions.split('\n').slice(0, 6).join('\n')}...`);
      
      const systemMessage = buildSystemMessage(
        variabilityInstructions,
        language,
        difficulty,
        questionCount,
        maxTokens
      );

      const messages = [
        {
          role: "system" as const,
          content: systemMessage
        },
        {
          role: "user" as const,
          content: buildUserMessage(content, questionCount, uniqueToken)
        }
      ];

      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const rawResponse = response.choices[0]?.message?.content || "";
      const quiz = parseQuiz(rawResponse, questionCount);
      
      console.log(`✅ Quiz generated successfully with fingerprint: ${sessionFingerprint}`);
      return quiz;
    } catch (error) {
      console.error(`❌ Retry attempt ${attempts} failed:`, error);
      
      if (attempts === maxAttempts) {
        throw new Error(`Failed to generate quiz with correct number of questions after ${maxAttempts} attempts`);
      }
    }
  }

  throw new Error("Failed to generate quiz after all attempts");
}
