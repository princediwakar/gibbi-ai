import OpenAI from "openai";
import { Quiz } from "../types/quiz";
import { randomUUID } from "crypto";
import { isCompleteResponse, cleanResponse, parseJSONSafely } from "./ai-utils";

// Validate environment variables
const REQUIRED_ENV_VARS = ["OPENAI_API_KEY",
	"AI_BASE_URL"
];

REQUIRED_ENV_VARS.forEach((varName) => {
	if (!process.env[varName]) {
		throw new Error(
			`Missing ${varName} in environment variables.`
		);
	}
});


const AI_BASE_URL =
	process.env.AI_BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MAX_ATTEMPTS = 3


// Create a singleton OpenAI instance
const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
	baseURL: AI_BASE_URL,
});



// 🔥 NEW: Randomized tones for different engagement styles
const quizTones = [
	"Academic and serious",
	"Challenging and competitive",
	"Exam-oriented",
];

// 🔥 NEW: Creativity Modifiers - forces AI to think differently
const creativityModifiers = [
	"Ensure the questions have wide variety and perspective.",
	"Ask questions of various sub-topics of the given topic.",
	"Incorporate real-world scenarios and case studies.",
];

// Additional variability instructions - pick one at random for each generation
const additionalVariabilityInstructions = [
	"Use vivid, creative language and generate entirely new scenarios.",
	"Incorporate unexpected twists and fresh perspectives in the questions.",
	"Avoid formulaic phrasing and ensure the examples are never reused.",
	"Adopt a dynamic tone that challenges conventional quiz formats.",
	"Infuse the quiz with innovative wording and unique question angles.",
];

// Randomly selects an item from an array
const pickRandom = (arr: string[]) =>
	arr[Math.floor(Math.random() * arr.length)];






export async function createQuizWithAI(
    prompt: string,
    question_count: number, 
    difficulty: string,
    language: string
): Promise<Quiz> {

    const selectedTone = pickRandom(quizTones);
    const selectedCreativityModifier = pickRandom(creativityModifiers);
    const additionalInstruction = pickRandom(additionalVariabilityInstructions)

    // Assemble variability instructions with extra emphasis on uniqueness and randomness
    const variabilityInstructions = `
    1. The tone should be "${selectedTone}".
    2. ${selectedCreativityModifier}
    3. ${additionalInstruction}
    `;
    
    // Calculate max tokens based on the number of questions
    const tokensPerQuestion = 100; // Adjust this value based on your needs
    const baseTokens = 500; // Base tokens for metadata and structure
    const maxTokens = Math.min(baseTokens + (question_count * tokensPerQuestion), 4096);

    const systemMessageContent = `You are an AI that generates quizzes. Extract metadata and generate questions based on a user prompt.
    1. Generate a very short title based on the user prompt.
    2. ${variabilityInstructions}
    3. Language: ${language}. Auto-detect the language if needed. Difficulty should always be either Easy, Medium or Hard.
    4. Output must be a valid JSON object strictly matching this format:
    {
        "title": string,
        "description": string,
        "topic": string,
        "subject": string, // Parent category of topic. Be consistent in naming. e.g. Use "Mathematics" for "Maths", "Math"
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
    IMPORTANT: Do not wrap your output in markdown formatting or triple backticks. Append the token "END_OF_JSON" at the very end of the output and nothing else.`;


    const totalStart = performance.now();
    let generationTime = 0;
    let cleaningTime = 0;
    let parsingTime = 0;
    let validationTime = 0;

    try {
        console.log(`Generating quiz for prompt: "${prompt.slice(0, 60)}" with max tokens: ${maxTokens}`);

        let fullResponse = "";
        let attempts = 0;
        let completed = false;
        let quizData: Quiz | null = null;

        const generationStart = performance.now();
        while (attempts < MAX_ATTEMPTS && !completed) {
            // Inject a new unique token each attempt
            const currentUniqueToken = randomUUID();
            const userContent =
                attempts === 0
                    ? `Generate a quiz for the following user prompt wrapped in ####. User prompt: ####${prompt}####. Number of questions: ${question_count}. Difficulty level: ${difficulty}. Include a unique variation marker: ${currentUniqueToken}.`
                    : `The previous output was incomplete. Continue generating the remaining part of the JSON object without repeating previous content. Include a unique variation marker: ${currentUniqueToken}.`;

            try {
                const response = await openai.chat.completions.create({
                    model: "deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: systemMessageContent,
                        },
                        {
                            role: "user",
                            content: userContent,
                        },
                    ],
                    temperature: 0.9, // increased randomness
                    top_p: 0.9, // allow more diverse word choices
                    max_tokens: maxTokens, // Use the dynamically calculated max tokens
                });

                const content = response?.choices?.[0]?.message?.content;
                console.log(`Tokens used in this request: ${response?.usage?.total_tokens}`); // Log the number of tokens used

                if (!content) {
                    throw new Error("Received empty response from OpenAI.");
                }
                if (content.startsWith("An error") || content.startsWith("Error")) {
                    throw new Error(content);
                }

                fullResponse += content;

                if (isCompleteResponse(fullResponse)) {
                    // Clean and parse the response
                    const cleaningStart = performance.now();
                    const cleanedOutput = cleanResponse(fullResponse);
                    cleaningTime = performance.now() - cleaningStart;

                    const parsingStart = performance.now();
                    quizData = parseJSONSafely(cleanedOutput);
                    parsingTime = performance.now() - parsingStart;

                    // Validate the structure
                    const validationStart = performance.now();
                    if (!quizData.title || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
                        throw new Error("Invalid quiz data structure received from OpenAI.");
                    }
                    validationTime = performance.now() - validationStart;

                    completed = true;
                } else {
                    attempts++;
                }
            } catch (error) {
                if (attempts < MAX_ATTEMPTS - 1) {
                    console.warn(`Attempt ${attempts + 1} failed, retrying...`, error);
                    attempts++;
                    continue;
                }
                throw error;
            }
        }
        generationTime = performance.now() - generationStart;

        const totalEnd = performance.now();
        const totalTime = totalEnd - totalStart;

        console.log(`\nAI Generation Performance Metrics:`);
        console.log(`- Response Generation: ${generationTime.toFixed(2)}ms`);
        console.log(`- Response Cleaning: ${cleaningTime.toFixed(2)}ms`);
        console.log(`- JSON Parsing: ${parsingTime.toFixed(2)}ms`);
        console.log(`- Data Validation: ${validationTime.toFixed(2)}ms`);
        console.log(`- Total Time: ${totalTime.toFixed(2)}ms`);
        console.log(`- Attempts: ${attempts + 1}`);
        console.log(`- Response Length: ${fullResponse.length} characters`);

        if (!quizData) {
            throw new Error("Quiz data generation failed.");
        }
        return quizData;
    } catch (error) {
        console.error("Error in createQuizWithAI:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to generate quiz with AI");
    }
}