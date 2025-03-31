import OpenAI from "openai";
import { randomUUID } from "crypto";
import { isCompleteResponse, cleanResponse, parseJSONSafely } from "./ai-utils";

// Define the type for what the AI generates (subset of Quiz)
export interface GeneratedQuiz {
  title: string;
  description: string;
  topic: string;
  subject: string;
  language: string;
  difficulty: string;
  questions: {
    question_text: string;
    options: { [key: string]: string };
    correct_option: string;
  }[];
}

const REQUIRED_ENV_VARS = ["OPENAI_API_KEY", "AI_BASE_URL"];
REQUIRED_ENV_VARS.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing ${varName} in environment variables.`);
  }
});

const AI_BASE_URL = process.env.AI_BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MAX_ATTEMPTS = 5;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: AI_BASE_URL,
});

const quizTones = [
  "Engaging and clear",
  "Challenging and thought-provoking",
  "Informative and concise",
];

const creativityModifiers = [
  "Ensure questions cover a range of difficulty and question types.",
  "Incorporate diverse perspectives and applications of the content.",
  "Create questions that test both factual recall and critical thinking.",
];

const questionTypes = [
  "Factual knowledge and recall questions.",
  "Analytical questions requiring reasoning or problem-solving.",
  "Application-based questions using real or hypothetical scenarios.",
  "Conceptual understanding and comparison questions.",
];

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export async function createQuizWithAI(
  content: string,
  question_count: number,
  difficulty: string,
  language: string
): Promise<GeneratedQuiz> {
  const selectedTone = pickRandom(quizTones);
  const selectedCreativityModifier = pickRandom(creativityModifiers);
  const selectedQuestionType = pickRandom(questionTypes);

  const variabilityInstructions = `
    1. Tone: ${selectedTone}
    2. ${selectedCreativityModifier}
    3. ${selectedQuestionType}
    4. Adapt questions to the content type (e.g., math problems for math, historical events for history, concepts for books).
    5. Ensure questions are specific to the provided content or prompt.
    6. Maintain variety and avoid repetitive or overly generic questions.
  `;

  const baseTokens = 500;
  const tokensPerQuestion = 200;
  const maxTokens = Math.min(baseTokens + question_count * tokensPerQuestion, 8000);

  const systemMessageContent = (remaining: number) => `You are an AI that generates high-quality quizzes from provided content.
    Instructions:
    ${variabilityInstructions}
    Language: ${language} (auto-detect if needed).
    Difficulty: ${difficulty} (Easy, Medium, or Hard - adjust complexity accordingly).
    Input is a text string containing the content to generate the quiz from.
    Generate exactly ${remaining} concise, detailed questions and options.
    Output must be a valid JSON object in this exact format:
    {
      "title": string,
      "description": string,
      "topic": string,
      "subject": string,
      "language": string,
      "difficulty": string,
      "questions": [
        {
          "question_text": string,
          "options": { [key: string]: string },
          "correct_option": string
        }
      ]
    }
    IMPORTANT: After completing the JSON, append "END_OF_JSON" and stop generating further content. Do not produce additional quizzes, explanations, or any text beyond "END_OF_JSON". Ensure the output fits within ${maxTokens} tokens to avoid truncation. Do not wrap your output in markdown formatting or triple backticks.`;

  const totalStart = performance.now();
  let generationTime = 0;
  let cleaningTime = 0;
  let parsingTime = 0;
  let validationTime = 0;

  try {
    console.log(`Generating quiz with text content - max tokens: ${maxTokens}`);

    let attempts = 0;
    const partialQuiz: Partial<GeneratedQuiz> = {
      questions: [],
      language,
      difficulty,
    };
    let remainingQuestions = question_count;

    const generationStart = performance.now();
    while (attempts < MAX_ATTEMPTS && partialQuiz.questions!.length < question_count) {
      const currentUniqueToken = randomUUID();
      const userContent = `Generate a quiz from this content: ####${content}####. Number of questions: ${remainingQuestions}. Unique marker: ${currentUniqueToken}.`;

      try {
        const response = await openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemMessageContent(remainingQuestions) },
            { role: "user", content: userContent },
          ],
          temperature: 0.75,
          top_p: 0.9,
          max_tokens: maxTokens,
        });

        const responseContent = response?.choices?.[0]?.message?.content;
        console.log(`Attempt ${attempts + 1} - Tokens used: ${response?.usage?.total_tokens}`);
        console.log(`Raw response: ${responseContent?.slice(0, 100)}...`);

        if (!responseContent) throw new Error("Empty response from OpenAI.");
        if (responseContent.startsWith("Error")) throw new Error(responseContent);

        const cleaningStart = performance.now();
        const cleanedOutput = cleanResponse(responseContent);
        cleaningTime += performance.now() - cleaningStart;

        const parsingStart = performance.now();
        const quizData = parseJSONSafely(cleanedOutput);
        parsingTime += performance.now() - parsingStart;

        const validationStart = performance.now();
        const validQuestions = quizData.questions?.filter(
          (q) => q.question_text && q.options && q.correct_option
        ) || [];
        validationTime += performance.now() - validationStart;

        // Merge metadata on first valid response
        if (!partialQuiz.title && quizData.title) {
          partialQuiz.title = quizData.title;
          partialQuiz.description = quizData.description;
          partialQuiz.topic = quizData.topic;
          partialQuiz.subject = quizData.subject;
        }

        // Add valid questions
        partialQuiz.questions!.push(...validQuestions);
        remainingQuestions = question_count - partialQuiz.questions!.length;

        console.log(`Attempt ${attempts + 1} added ${validQuestions.length} questions. Remaining: ${remainingQuestions}`);

        if (!isCompleteResponse(responseContent) || validQuestions.length < quizData.questions.length) {
          console.log(`Attempt ${attempts + 1} incomplete or invalid: ${responseContent.slice(0, 100)}...`);
          attempts++;
          continue;
        }

        // If we have all questions, break
        if (partialQuiz.questions!.length >= question_count) break;
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        attempts++;
        if (attempts >= MAX_ATTEMPTS) break; // Move to fallback
      }
    }
    generationTime = performance.now() - generationStart;

    const totalEnd = performance.now();
    const totalTime = totalEnd - totalStart;

    console.log(`\nAI Generation Performance Metrics:`);
    console.log(`- Generation: ${generationTime.toFixed(2)}ms`);
    console.log(`- Cleaning: ${cleaningTime.toFixed(2)}ms`);
    console.log(`- Parsing: ${parsingTime.toFixed(2)}ms`);
    console.log(`- Validation: ${validationTime.toFixed(2)}ms`);
    console.log(`- Total Time: ${totalTime.toFixed(2)}ms`);

    if (partialQuiz.questions!.length === 0) {
      throw new Error("Quiz generation failed after all attempts.");
    } else if (partialQuiz.questions!.length < question_count) {
      console.warn(`Only generated ${partialQuiz.questions!.length}/${question_count} questions.`);
    }

    // Ensure we don’t exceed requested question count
    partialQuiz.questions = partialQuiz.questions!.slice(0, question_count);

    // Construct the final GeneratedQuiz object
    const quiz: GeneratedQuiz = {
      title: partialQuiz.title || "Generated Quiz",
      description: partialQuiz.description || "A quiz generated from provided content",
      topic: partialQuiz.topic || "General",
      subject: partialQuiz.subject || "Miscellaneous",
      language: partialQuiz.language!,
      difficulty: partialQuiz.difficulty!,
      questions: partialQuiz.questions!,
    };

    return quiz;
  } catch (error) {
    console.error("Error in createQuizWithAI:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate quiz");
  }
}