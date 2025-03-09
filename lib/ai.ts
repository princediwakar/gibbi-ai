import { Quiz } from "@/types/quiz";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
	throw new Error(
		"OPENAI_API_KEY is not defined in environment variables"
	);
}
if (!process.env.BASE_URL) {
	throw new Error(
		"BASE_URL is not defined in environment variables"
	);
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.BASE_URL,
	timeout: 30000, // Add timeout
	maxRetries: 2, // Add retries
});

// interface Question {
// 	question_text: string;
// 	options: Record<string, string>;
// 	correct_option: string;
// }
// Create Quiz with AI

// export async function createQuizWithAI(prompt: string) {
// 	try {
// 		console.log("Generating quiz with prompt:", prompt);

// 		const openaiResponse =
// 			await openai.chat.completions.create({
// 				model: "deepseek-chat",
// 				messages: [
// 					{
// 						role: "system",
// 						content: `You are an AI that generates quizzes. Extract metadata and generate questions based on user input. By default, generate 5 questions of intermediate difficulty. Return a valid JSON object with the following structure:
//                     {
//                         "title": string,
//                         "description": string,
//                         "topic": string,
// 						"subject": string,
//                         "difficulty": string,
//                         "num_questions": number,
//                         "questions": [
//                             {
//                                 "question_text": string,
//                                 "options": {
//                                     "a": string,
//                                     "b": string,
//                                     "c": string,
//                                     "d": string
//                                 },
//                                 "correct_option": string
//                             }
//                         ]
//                     }`,
// 					},
// 					{
// 						role: "user",
// 						content: `Generate a test for: ${prompt}`,
// 					},
// 				],
// 				response_format: { type: "json_object" }, // Use standard JSON format
// 				temperature: 0.7,
// 				max_tokens: 2000,
// 			});

// 		console.log("OpenAI Response:", openaiResponse);

// 		if (!openaiResponse?.choices[0]?.message?.content) {
// 			throw new Error(
// 				"Invalid or empty response from OpenAI"
// 			);
// 		}

// 		const quizData = JSON.parse(
// 			openaiResponse.choices[0].message.content
// 		);
// 		console.log("Parsed Quiz Data:", quizData);

// 		// Validate the structure of quizData
// 		if (
// 			!quizData.title ||
// 			!quizData.questions ||
// 			!Array.isArray(quizData.questions) ||
// 			!quizData.questions.every(
// 				(q: Question) =>
// 					q.question_text &&
// 					q.options &&
// 					q.correct_option
// 			)
// 		) {
// 			throw new Error(
// 				"Invalid quiz data structure from OpenAI"
// 			);
// 		}

// 		return quizData;
// 		// Update the error handling
// 	} catch (error: unknown) {
// 		console.error("Error in createQuizWithAI:", error);
// 		const errorMessage =
// 			error instanceof Error
// 				? error.message
// 				: "Failed to generate quiz with AI";
// 		throw new Error(errorMessage);
// 	}
// }


export async function createQuizWithAI(prompt: string) {
	try {
		console.log("Generating quiz with prompt:", prompt);

		const openaiResponse =
			await openai.chat.completions.create({
				model: "deepseek-chat",
				messages: [
					{
						role: "system",
						content: `You are the expert quizmaster who helps users prepare for interviews on any topic or exam or job role.
						You generate quizzes which help users test their skills and knowledge on the give topic or exam or job role.
						Extract metadata and generate questions based on user prompt. 
						By default, generate 5 questions of intermediate difficulty. 
						Return a valid JSON object with the following structure:
                    {
                        "title": string,
                        "description": string,
                        "topic": string,
						"subject": string,
                        "difficulty": string,
                        "num_questions": number,
                        "questions": [
                            {
                                "question_text": string,
                                "options": {
                                    "a": string,
                                    "b": string,
                                    "c": string,
                                    "d": string
                                },
                                "correct_option": string
                            }
                        ]
                    }`,
					},
					{
						role: "user",
						content: `Generate a quiz for: ${prompt}`,
					},
				],
				response_format: { type: "json_object" },
				temperature: 0.7,
				max_tokens: 5000,
			});

		console.log("OpenAI Response:", openaiResponse);

		const choice = openaiResponse.choices[0];
		if (!choice?.message?.content) {
			throw new Error(
				"Invalid or empty response from OpenAI"
			);
		}

		// Handle truncated responses
		if (choice.finish_reason === "length") {
			console.warn(
				"Response was truncated due to token limit"
			);
			const content = choice.message.content;

			// Try to extract valid JSON from the truncated response
			const lastBrace = content.lastIndexOf("}");
			if (lastBrace !== -1) {
				const partialJson = content.slice(
					0,
					lastBrace + 1
				);
				try {
					const quizData =
						JSON.parse(partialJson);
					if (validateQuizData(quizData)) {
						console.log(
							"Using partial quiz data from truncated response"
						);
						return quizData;
					}
				} catch (error) {
					console.warn(
						"Failed to parse partial JSON:",
						error
					);
				}
			}
			throw new Error(
				"Response was truncated and could not be parsed"
			);
		}

		const quizData = JSON.parse(choice.message.content);
		console.log("Parsed Quiz Data:", quizData);

		if (!validateQuizData(quizData)) {
			throw new Error(
				"Invalid quiz data structure from OpenAI"
			);
		}

		return quizData;
	} catch (error: unknown) {
		console.error("Error in createQuizWithAI:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to generate quiz with AI";
		throw new Error(errorMessage);
	}
}

// Enhanced validation function
function validateQuizData(data: Quiz): data is Quiz {
	if (typeof data !== "object" || data === null)
		return false;

	// Required fields
	if (!data.title || typeof data.title !== "string")
		return false;
	if (!data.questions || !Array.isArray(data.questions))
		return false;

	// Validate each question
	for (const q of data.questions) {
		if (
			!q.question_text ||
			typeof q.question_text !== "string"
		)
			return false;
		if (!q.options || typeof q.options !== "object")
			return false;
		if (
			!q.correct_option ||
			typeof q.correct_option !== "string"
		)
			return false;

		// Validate options structure
		const options = Object.values(q.options);
		if (
			options.length < 2 ||
			options.some((opt) => typeof opt !== "string")
		) {
			return false;
		}
	}

	return true;
}