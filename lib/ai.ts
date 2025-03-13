import OpenAI from "openai";
import {Question} from '@/types/quiz'
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

//  Quiz Configuration
const defaultQuestionCount = process.env.DEFAULT_QUESTION_COUNT
const default_difficulty = process.env.DEFAULT_DIFFICULTY
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
If the user doesn't specify difficulty or number of questions, then by default generate ${defaultQuestionCount} questions of ${default_difficulty} difficulty level.

For questions or options involving mathematics or equations, format the mathematical expressions using LaTeX notation inside double dollar signs ($$...$$) for block equations and single dollar signs ($...$) for inline equations.
For mathematical expressions:
- Use $...$ for inline math
- Use $$...$$ for display math
- Ensure all math expressions are properly escaped

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
      "question_text": string, // May contain LaTeX math expressions
      "options": { "a": string, "b": string, "c": string, "d": string }, // May contain LaTeX math expressions
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
		// First, replace escaped backslashes with a temporary marker
		let cleanedString = jsonString.replace(
			/\\\\/g,
			"\\BACKSLASH\\"
		);

		// Remove invalid control characters
		cleanedString = cleanedString.replace(
			/[\x00-\x1F\x7F]/g,
			""
		);

		// Restore LaTeX backslashes
		cleanedString = cleanedString.replace(
			/\\BACKSLASH\\/g,
			"\\\\"
		);

		// Parse the JSON
		const parsedData = JSON.parse(cleanedString);

		// Validate and clean each question
		const cleanedData: QuizData = {
			...parsedData,
			questions: parsedData.questions.map(
				(question: Question) => ({
					...question,
					question_text: cleanLaTeX(
						question.question_text
					),
					options: Object.fromEntries(
						Object.entries(
							question.options
						).map(([key, value]) => [
							key,
							cleanLaTeX(value as string),
						])
					),
				})
			),
		};

		return cleanedData;
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
const cleanLaTeX = (text: string): string => {
    // Replace problematic LaTeX sequences
    return text
        .replace(/\\{/g, '{')
        .replace(/\\}/g, '}')
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\$/g, '$');
};

export async function createQuizWithAI(
	prompt: string
): Promise<QuizData> {
	try {
		console.log(
			`Generating quiz for prompt: "${prompt}"`
		);

		let fullResponse = "";
		let attempts = 0;
		let completed = false;

		// Loop to accumulate response until we detect the END_OF_JSON marker.
		while (attempts < maxAttempts && !completed) {
			const userContent =
				attempts === 0
					? `Generate a quiz for the following prompt: ${prompt}. Please return the output as a JSON object following the specified format and include "END_OF_JSON" at the end.`
					: `The previous output was incomplete or invalid. Continue generating the remaining part of the JSON object without repeating what was already provided.`;

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

				// Accumulate the response text
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

		if (!completed) {
			throw new Error(
				"Failed to generate a complete JSON response after multiple attempts."
			);
		}

		let quizData: QuizData;
		try {
			const cleanedOutput =
				cleanResponse(fullResponse);
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

		if (
			!quizData.title ||
			!Array.isArray(quizData.questions) ||
			quizData.questions.length === 0
		) {
			throw new Error(
				"Invalid quiz data structure received from OpenAI."
			);
		}

		console.log("Parsed Quiz Data:", quizData);
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
