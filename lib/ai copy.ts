import OpenAI from "openai";
import { Quiz } from "../types/quiz";
import { randomUUID } from "crypto";

// Validate environment variables
const validateEnvVars = () => {
	if (!process.env.OPENAI_API_KEY) {
		throw new Error(
			"Missing OPENAI_API_KEY in environment variables."
		);
	}
	if (!process.env.BASE_URL) {
		throw new Error(
			"Missing BASE_URL in environment variables."
		);
	}
};

// Validate environment variables once at startup
validateEnvVars();

const AI_BASE_URL =
	process.env.NEXT_PUBLIC_AI_BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Create a singleton OpenAI instance
const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
	baseURL: AI_BASE_URL,
});

// Configuration
const maxAttempts = Number(process.env.MAX_ATTEMPTS);
const maxTokens = Number(process.env.MAX_TOKENS);

// Revised system prompt with explicit uniqueness instructions

// Utility to check if the accumulated response is complete.
const isCompleteResponse = (text: string): boolean => {
	return text.trim().endsWith("END_OF_JSON");
};

// Clean response: remove markdown formatting, the END_OF_JSON marker, and invalid control characters.
const cleanResponse = (text: string): string => {
	try {
		text = text
			.replace(/```(?:json)?\s*/gi, "")
			.replace(/\s*```/gi, "");
		text = text.replace(/END_OF_JSON\s*$/, "").trim();
		return text.replace(/[\x00-\x1F\x7F]/g, "");
	} catch (error) {
		console.error("Error cleaning response:", error);
		throw new Error("Failed to clean response");
	}
};

// Safely parse JSON, removing problematic control characters and invalid escape sequences.
const parseJSONSafely = (jsonString: string): Quiz => {
	try {
		let cleanedString = jsonString.replace(
			/[\x00-\x1F\x7F]/g,
			""
		);
		cleanedString = cleanedString.replace(
			/\\(?!["\\\/bfnrt]|u[0-9A-Fa-f]{4})/g,
			""
		);
		return JSON.parse(cleanedString);
	} catch (err) {
		console.error("Failed to parse JSON:", jsonString);
		throw new Error(
			`Failed to parse JSON: ${
				err instanceof Error
					? err.message
					: "Unknown error"
			}`
		);
	}
};

// Additional variability instructions - pick one at random for each generation
const additionalVariabilityInstructions = [
	"Use vivid, creative language and generate entirely new scenarios.",
	"Incorporate unexpected twists and fresh perspectives in the questions.",
	"Avoid formulaic phrasing and ensure the examples are never reused.",
	"Adopt a dynamic tone that challenges conventional quiz formats.",
	"Infuse the quiz with innovative wording and unique question angles.",
];
// 🔥 NEW: Randomized tones for different engagement styles
const quizTones = [
	"Academic and serious",
	"Challenging and competitive",
	"Exam-oriented",
];

// 🔥 NEW: Creativity Modifiers - forces AI to think differently
const creativityModifiers = [
	"Ensure the questions have wide variety and perspective.",
	"Ask questions in different ways.",
	"Incorporate real-world scenarios and case studies.",
];

// Randomly selects an item from an array
const pickRandom = (arr: string[]) =>
	arr[Math.floor(Math.random() * arr.length)];

function getRandomInstruction(): string {
	const randomIndex = Math.floor(
		Math.random() *
			additionalVariabilityInstructions.length
	);
	return additionalVariabilityInstructions[randomIndex];
}

export async function createQuizWithAI(
	prompt: string,
	numQuestions?: number,
	difficulty?: string,
	customInstructions?: string
): Promise<Quiz> {
	const uniquePromptSeed = randomUUID();
	const uniquePrompt = `${prompt} [${uniquePromptSeed}]`;

	const selectedTone = pickRandom(quizTones);
	const selectedCreativityModifier = pickRandom(
		creativityModifiers
	);
	const systemMessageContent = `You are an AI that generates quizzes. Extract metadata and generate questions based on a user prompt that may include context about topic, subject, difficulty, target audience and number of questions.
	0. Generate a user-friendly title focusing on the topic only, not the modifiers.
  1. Generate ${numQuestions} questions
  2. Use ${difficulty} difficulty
  3. ${
		customInstructions
			? `IMPORTANT: Follow these custom instructions: ${customInstructions}`
			: ""
  }
	4. Map any provided difficulty to one of these levels: Easy, Medium, or Hard.
	5. Ensure every output is distinctly different in wording, structure, and examples. Do not replicate any phrasing or scenarios from prior outputs
	6. Output must be a valid JSON object strictly matching this format:
	{
	"title": string,
	"description": string,
	"topic": string,
	"subject": string,
	"difficulty": string,
	"questions": [
		{
		"question_text": string,
		"options": { "a": string, "b": string, "c": string, "d": string },
		"correct_option": string
		}
	]
	}
	IMPORTANT: Do not wrap your output in markdown formatting or triple backticks. Append the token "END_OF_JSON" at the very end of the output and nothing else.`;

	// Assemble variability instructions with extra emphasis on uniqueness and randomness
	const variabilityInstructions = `
    1. The tone should be "${selectedTone}".
    2. ${selectedCreativityModifier}
    3. Ensure each quiz is DISTINCTLY DIFFERENT from previous ones, changing phrasing, contexts, and question logic.
    4. Inject a variation token: ${randomUUID()} to guarantee uniqueness.
    5. ${getRandomInstruction()}
  `;

	const totalStart = performance.now();
	let generationTime = 0;
	let cleaningTime = 0;
	let parsingTime = 0;
	let validationTime = 0;

	try {
		console.log(
			`Generating quiz for prompt: "${prompt}"`
		);

		let fullResponse = "";
		let attempts = 0;
		let completed = false;
		let quizData: Quiz | null = null;

		const generationStart = performance.now();
		while (attempts < maxAttempts && !completed) {
			// Inject a new unique token each attempt
			const currentUniqueToken = randomUUID();
			const userContent =
				attempts === 0
					? `Generate a quiz for the following prompt: ${uniquePrompt}. ${customInstructions} ${variabilityInstructions} Include a unique variation marker: ${currentUniqueToken}. Return the output as a JSON object following the specified format and include "END_OF_JSON" at the end.`
					: `The previous output was incomplete or too similar. Continue generating the remaining part of the JSON object without repeating previous content. ${customInstructions} ${variabilityInstructions} Ensure the variation marker is different from any previous ones.`;

			try {
				const response =
					await openai.chat.completions.create({
						model: "deepseek-chat",
						messages: [
				 			{
								role: "system",
								content:
									systemMessageContent,
							},
							{
								role: "user",
								content: userContent,
							},
						],
						temperature: 0.9, // increased randomness
						top_p: 0.9, // allow more diverse word choices
						max_tokens: maxTokens,
					});

				const content =
					response?.choices?.[0]?.message
						?.content;
				if (!content) {
					throw new Error(
						"Received empty response from OpenAI."
					);
				}
				if (
					content.startsWith("An error") ||
					content.startsWith("Error")
				) {
					throw new Error(content);
				}

				fullResponse += content;

				if (isCompleteResponse(fullResponse)) {
					// Clean and parse the response
					const cleaningStart = performance.now();
					const cleanedOutput =
						cleanResponse(fullResponse);
					cleaningTime =
						performance.now() - cleaningStart;

					const parsingStart = performance.now();
					quizData =
						parseJSONSafely(cleanedOutput);
					parsingTime =
						performance.now() - parsingStart;

					// Validate the structure
					const validationStart =
						performance.now();
					if (
						!quizData.title ||
						!Array.isArray(
							quizData.questions
						) ||
						quizData.questions.length === 0
					) {
						throw new Error(
							"Invalid quiz data structure received from OpenAI."
						);
					}
					validationTime =
						performance.now() - validationStart;

					completed = true;
				} else {
					attempts++;
				}
			} catch (error) {
				if (attempts < maxAttempts - 1) {
					console.warn(
						`Attempt ${
							attempts + 1
						} failed, retrying...`,
						error
					);
					attempts++;
					continue;
				}
				throw error;
			}
		}
		generationTime =
			performance.now() - generationStart;

		const totalEnd = performance.now();
		const totalTime = totalEnd - totalStart;

		console.log(`\nAI Generation Performance Metrics:`);
		console.log(
			`- Response Generation: ${generationTime.toFixed(
				2
			)}ms`
		);
		console.log(
			`- Response Cleaning: ${cleaningTime.toFixed(
				2
			)}ms`
		);
		console.log(
			`- JSON Parsing: ${parsingTime.toFixed(2)}ms`
		);
		console.log(
			`- Data Validation: ${validationTime.toFixed(
				2
			)}ms`
		);
		console.log(
			`- Total Time: ${totalTime.toFixed(2)}ms`
		);
		console.log(`- Attempts: ${attempts + 1}`);
		console.log(
			`- Response Length: ${fullResponse.length} characters`
		);

		if (!quizData) {
			throw new Error("Quiz data generation failed.");
		}
		return quizData;
	} catch (error) {
		console.error("Error in createQuizWithAI:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to generate quiz with AI"
		);
	}
}
