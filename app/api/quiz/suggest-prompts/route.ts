import { NextResponse } from "next/server";
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


export async function POST(req: Request) {
	const { prompt } = await req.json();

	try {
		const completion =
			await openai.chat.completions.create({
				messages: [
					{
						role: "system",
						content: `You are a helpful quiz generator. Given a topic, suggest 5 related quiz topics. 
          Return them as a JSON array of strings. Example: ["Topic 1", "Topic 2", "Topic 3"]`,
					},
					{ role: "user", content: prompt },
				],
				model: 'deepseek-chat',
				response_format: { type: "json_object" },
			});

		const suggestions = JSON.parse(
			completion.choices[0].message.content || "{}"
		);
		return NextResponse.json({
			suggestions: suggestions.topics || [],
		});
	} catch (error) {
		console.error(
			"Error generating suggestions:",
			error
		);
		return NextResponse.json(
			{ error: "Failed to generate suggestions" },
			{ status: 500 }
		);
	}
}
