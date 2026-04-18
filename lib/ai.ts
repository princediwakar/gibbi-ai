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
import { searchCurrentAffairs, formatSearchContext } from "./tavily";

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

// Keywords that suggest current affairs / recent events
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

// Check if the content might require current information
function needsCurrentAffairsSearch(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  // Check for time-related keywords
  const hasTimeKeyword = CURRENT_AFFAIRS_KEYWORDS.some(keyword => 
    lowerContent.includes(keyword.toLowerCase())
  );
  
  // Check for question patterns that suggest recent info needed
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

// Determine if we should search and get context
async function getSearchContext(content: string): Promise<string | null> {
  // Skip if no Tavily API key configured
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
  
  // Check if we need to search for current affairs
  const searchContext = await getSearchContext(content);
  
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
          content: buildUserMessage(content, questionCount, uniqueToken, searchContext)
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
