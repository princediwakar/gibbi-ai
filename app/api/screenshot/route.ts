 import { NextResponse } from "next/server";
 import { getQuizMetadata } from "@/lib/getQuizMetadata";

 export async function GET(request: Request) {
		const { searchParams } = new URL(request.url);
		const quizId = searchParams.get("quizId");

		if (!quizId) {
			return NextResponse.json(
				{ error: "Quiz ID is required" },
				{ status: 400 }
			);
		}

		try {
			const quiz = await getQuizMetadata(quizId);
			if (!quiz) {
				return NextResponse.json(
					{ error: "Quiz not found" },
					{ status: 404 }
				);
			}

			// Generate the screenshot URL
			const screenshotUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${quizId}/screenshot`;

			return NextResponse.json({ screenshotUrl });
		} catch (error) {
			console.error(
				"Error generating screenshot URL:",
				error
			);
			return NextResponse.json(
				{ error: "Failed to generate screenshot" },
				{ status: 500 }
			);
		}
 }