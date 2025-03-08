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
	timeout: 10000, // Add timeout
	maxRetries: 2, // Add retries
});

// Create Quiz with AI

export async function createQuizWithAI(prompt: string) {
	try {
		console.log("Generating quiz with prompt:", prompt);

		const openaiResponse =
			await openai.chat.completions.create({
				model: "deepseek-chat",
				messages: [
					{
						role: "system",
						content: `You are an AI that generates quizzes. Extract metadata and generate questions based on user input. By default, generate 2 questions and Intermediate difficulty. Return a valid JSON object with the following structure:
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
						content: `Generate a test for: ${prompt}`,
					},
				],
				response_format: { type: "json_object" }, // Use standard JSON format
				temperature: 0.7,
				max_tokens: 1000,
			});

		console.log("OpenAI Response:", openaiResponse);

		if (!openaiResponse?.choices[0]?.message?.content) {
			throw new Error(
				"Invalid or empty response from OpenAI"
			);
		}

		const quizData = JSON.parse(
			openaiResponse.choices[0].message.content
		);
		console.log("Parsed Quiz Data:", quizData);

		// Validate the structure of quizData
		if (
			!quizData.title ||
			!quizData.questions ||
			!Array.isArray(quizData.questions) ||
			!quizData.questions.every(
				(q: any) =>
					q.question_text &&
					q.options &&
					q.correct_option
			)
		) {
			throw new Error(
				"Invalid quiz data structure from OpenAI"
			);
		}

		return quizData;
	} catch (error) {
		console.error("Error in createQuizWithAI:", error);
		throw new Error(
			`Failed to generate quiz with AI: ${error.message}`
		);
	}
}