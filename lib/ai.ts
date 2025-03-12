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
const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_DIFFICULTY = "Advanced";
const MAX_ATTEMPTS = 5;

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

// System message content
const systemMessageContent = `You are an AI that generates quizzes. Extract metadata and generate questions based on a user prompt that may include topic, subject, difficulty & number of questions.
If the user specifies difficulty, map it to one of these levels: Beginner, Intermediate, or Advanced.
If the user doesn't specify difficulty or number of questions, then by default generate ${DEFAULT_QUESTION_COUNT} questions of ${DEFAULT_DIFFICULTY} difficulty level.
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

// Enhanced JSON parsing with error handling
const parseJSONSafely = (jsonString: string): QuizData => {
	try {
		// Remove any invalid control characters
		const cleanedString = jsonString.replace(
			/[\x00-\x1F\x7F]/g,
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

// Remove markdown formatting and the END_OF_JSON marker from the final output.
const cleanResponse = (text: string): string => {
	try {
		// Remove markdown code blocks
		text = text.replace(/```(?:json)?\s*/gi, "");
		text = text.replace(/\s*```/gi, "");

		// Remove END_OF_JSON marker
		text = text.replace(/END_OF_JSON\s*$/, "").trim();

		// Remove any invalid control characters
		return text.replace(/[\x00-\x1F\x7F]/g, "");
	} catch (error) {
		console.error("Error cleaning response:", error);
		throw new Error("Failed to clean response");
	}
};

/**
 * Generates a quiz using iterative completions to overcome potential truncation
 * or invalid JSON issues when generating a large output.
 */
// export async function createQuizWithAI(
// 	prompt: string
// ): Promise<QuizData> {
// 	try {
// 		console.log(
// 			`Generating quiz for prompt: "${prompt}"`
// 		);

// 		let fullResponse = "";
// 		let attempts = 0;
// 		let completed = false;

// 		// Loop to accumulate response until we detect the END_OF_JSON marker.
// 		while (attempts < MAX_ATTEMPTS && !completed) {
// 			const userContent =
// 				attempts === 0
// 					? `Generate a quiz for the following prompt: ${prompt}. Please return the output as a JSON object following the specified format and include "END_OF_JSON" at the end.`
// 					: `The previous output was incomplete or invalid. Continue generating the remaining part of the JSON object without repeating what was already provided.`;

// 			const response =
// 				await openai.chat.completions.create({
// 					model: "deepseek-chat",
// 					messages: [
// 						{
// 							role: "system",
// 							content: systemMessageContent,
// 						},
// 						{
// 							role: "user",
// 							content: userContent,
// 						},
// 					],
// 					temperature: 0.7,
// 					max_tokens: 2000,
// 				});

// 			const content =
// 				response?.choices?.[0]?.message?.content;
// 			if (!content) {
// 				throw new Error(
// 					"Received empty response from OpenAI."
// 				);
// 			}

// 			// Accumulate the response text
// 			fullResponse += content;

// 			// Check if the full response ends with the required end marker.
// 			if (isCompleteResponse(fullResponse)) {
// 				completed = true;
// 			} else {
// 				attempts++;
// 			}
// 		}

// 		if (!completed) {
// 			throw new Error(
// 				"Failed to generate a complete JSON response after multiple attempts."
// 			);
// 		}

// 		// Parse the JSON
// 		let quizData: QuizData;
// 		try {
// 			const cleanedOutput =
// 				cleanResponse(fullResponse);
// 			quizData = parseJSONSafely(cleanedOutput);
// 		} catch (err) {
// 			console.error("JSON parsing failed:", {
// 				fullResponse,
// 				error: err,
// 			});
// 			throw new Error(
// 				`Failed to parse quiz data: ${
// 					err instanceof Error
// 						? err.message
// 						: "Unknown error"
// 				}`
// 			);
// 		}

// 		// Validate basic structure of the quiz data
// 		if (
// 			!quizData.title ||
// 			!Array.isArray(quizData.questions) ||
// 			quizData.questions.length === 0
// 		) {
// 			throw new Error(
// 				"Invalid quiz data structure received from OpenAI."
// 			);
// 		}

// 		console.log("Parsed Quiz Data:", quizData);
// 		return quizData;
// 	} catch (error) {
// 		console.error("Error in createQuizWithAI:", error);
// 		throw new Error(
// 			error instanceof Error
// 				? error.message
// 				: "Failed to generate quiz with AI"
// 		);
// 	}
// }




export async function createQuizWithAI(prompt: string): Promise<QuizData> {
    try {
        console.log(`Generating quiz for prompt: "${prompt}"`);

        let fullResponse = "";
        let attempts = 0;
        let completed = false;

        // Loop to accumulate response until we detect the END_OF_JSON marker.
        while (attempts < MAX_ATTEMPTS && !completed) {
            const userContent = attempts === 0
                ? `Generate a quiz for the following prompt: ${prompt}. Please return the output as a JSON object following the specified format and include "END_OF_JSON" at the end.`
                : `The previous output was incomplete or invalid. Continue generating the remaining part of the JSON object without repeating what was already provided.`;

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
                    temperature: 0.7,
                    max_tokens: 2000,
                });

                const content = response?.choices?.[0]?.message?.content;
                if (!content) {
                    throw new Error("Received empty response from OpenAI.");
                }

                // Enhanced error message detection
                if (content.toLowerCase().includes("error") || 
                    content.toLowerCase().includes("invalid") ||
                    content.toLowerCase().includes("failed")) {
                    throw new Error(`API Error: ${content}`);
                }

                // Check if the response looks like JSON
                if (!content.trim().startsWith('{') && !content.trim().startsWith('[')) {
                    throw new Error(`Unexpected response format: ${content.substring(0, 100)}...`);
                }

                // Accumulate the response text
                fullResponse += content;

                // Check if the full response ends with the required end marker.
                if (isCompleteResponse(fullResponse)) {
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

        if (!completed) {
            throw new Error("Failed to generate a complete JSON response after multiple attempts.");
        }

        // Parse the JSON
        let quizData: QuizData;
        try {
            const cleanedOutput = cleanResponse(fullResponse);
            quizData = parseJSONSafely(cleanedOutput);
        } catch (err) {
            console.error('JSON parsing failed:', {
                fullResponse,
                error: err
            });
            throw new Error(`Failed to parse quiz data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

        // Validate basic structure of the quiz data
        if (!quizData.title || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("Invalid quiz data structure received from OpenAI.");
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