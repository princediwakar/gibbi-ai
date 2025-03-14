import OpenAI from "openai";

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

// Create a singleton OpenAI instance
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.BASE_URL,
});

// Configuration
const defaultQuestionCount = process.env.DEFAULT_QUESTION_COUNT;
const defaultDifficulty = process.env.DEFAULT_DIFFICULTY
const maxAttempts = Number(process.env.MAX_ATTEMPTS)
const maxTokens = Number(process.env.MAX_TOKENS)

interface QuizData {
	title: string;
	description: string;
	topic: string;
	subject: string;
	difficulty: string;
	num_questions: number;
	questions: Array<{
		question_text: string;
		options: {
			a: string;
			b: string;
			c: string;
			d: string;
		};
		correct_option: string;
	}>;
}

const systemMessageContent = `You are an AI that generates quizzes. Extract metadata and generate questions based on a user prompt that may include topic, subject, difficulty & number of questions.
If the user specifies difficulty, map it to one of these levels: Beginner, Intermediate, or Advanced.
If the user doesn't specify difficulty or number of questions, then by default generate ${defaultQuestionCount} questions of ${defaultDifficulty} difficulty level.
Output must be a valid JSON object strictly matching this format:
{
  "title": string,
  "description": string,
  "topic": string,
  "subject": string,
  "difficulty": string, // Must be one of: Beginner, Intermediate, Advanced
  "num_questions": number,
  "questions": [
    {
      "question_text": string,
      "options": { "a": string, "b": string, "c": string, "d": string },
      "correct_option": string
    }
  ]
}
IMPORTANT: Do not wrap your output in markdown formatting or triple backticks. Append the token "END_OF_JSON" (without quotes) at the very end of the output and nothing else.`;

// Utility to check if the accumulated response is complete.
const isCompleteResponse = (text: string): boolean => {
	return text.trim().endsWith("END_OF_JSON");
};

// Clean response: remove markdown formatting, the END_OF_JSON marker, and invalid control characters.
const cleanResponse = (text: string): string => {
	try {
		// Remove markdown code block markers (e.g., ```json ... ```)
		text = text
			.replace(/```(?:json)?\s*/gi, "")
			.replace(/\s*```/gi, "");
		// Remove the END_OF_JSON marker
		text = text.replace(/END_OF_JSON\s*$/, "").trim();
		// Remove any invalid control characters
		return text.replace(/[\x00-\x1F\x7F]/g, "");
	} catch (error) {
		console.error("Error cleaning response:", error);
		throw new Error("Failed to clean response");
	}
};

// Parse JSON safely by first removing control characters and stripping any invalid backslashes.
// This regex removes any backslash not followed by a valid escape sequence:
// Valid escapes are: ", \, /, b, f, n, r, t or a Unicode escape (\uXXXX)


const parseJSONSafely = (jsonString: string): QuizData => {
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






export async function createQuizWithAI(
	prompt: string
): Promise<QuizData> {
	// Add a unique identifier to the prompt
	const uniquePrompt = `${prompt} [${Date.now()}]`;

	// Add instructions for variability
	const variabilityInstructions = `
        IMPORTANT: 
        1. Generate unique questions that haven't been asked before
        2. Vary the question types and perspectives
        3. Use different examples and scenarios
        4. Ensure answers are not predictable
		5. Generate unique description every time.
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

		// Response Generation
		const generationStart = performance.now();
		while (attempts < maxAttempts && !completed) {
			const userContent =
				attempts === 0
					? `Generate a quiz for the following prompt: ${uniquePrompt}. ${variabilityInstructions} Please return the output as a JSON object following the specified format and include "END_OF_JSON" at the end.`
					: `The previous output was incomplete or invalid. Continue generating the remaining part of the JSON object without repeating what was already provided. ${variabilityInstructions}`;

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
						temperature: 0.7,
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

		// Response Cleaning
		const cleaningStart = performance.now();
		let cleanedOutput: string;
		try {
			cleanedOutput = cleanResponse(fullResponse);
		} catch (error) {
			console.error(
				"Response cleaning failed:",
				error
			);
			throw new Error(
				`Failed to clean response: ${
					error instanceof Error
						? error.message
						: "Unknown error"
				}`
			);
		}
		cleaningTime = performance.now() - cleaningStart;

		// JSON Parsing
		const parsingStart = performance.now();
		let quizData: QuizData;
		try {
			quizData = parseJSONSafely(cleanedOutput);
		} catch (err) {
			console.error("JSON parsing failed:", {
				fullResponse,
				error: err,
			});
			throw new Error(
				`Failed to parse quiz data: ${
					err instanceof Error
						? err.message
						: "Unknown error"
				}`
			);
		}
		parsingTime = performance.now() - parsingStart;

		// Data Validation
		const validationStart = performance.now();
		if (
			!quizData.title ||
			!Array.isArray(quizData.questions) ||
			quizData.questions.length === 0
		) {
			throw new Error(
				"Invalid quiz data structure received from OpenAI."
			);
		}
		validationTime =
			performance.now() - validationStart;

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
		console.log(
			`- Cleaned Length: ${cleanedOutput.length} characters`
		);

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
