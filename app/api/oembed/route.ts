import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const url = new URL(req.nextUrl);
	const quizId = url.searchParams
		.get("url")
		?.split("/")
		.pop(); // Extract quiz ID

	if (!quizId) {
		return NextResponse.json(
			{ error: "Quiz ID is required" },
			{ status: 400 }
		);
	}

	const embedHtml = `<iframe src="${process.env.NEXT_PUBLIC_BASE_URL}/embed/${quizId}" width="600" height="400" frameborder="0" allowfullscreen></iframe>`;

	return NextResponse.json({
		version: "1.0",
		type: "rich",
		provider_name: "QuizMaster",
		provider_url: process.env.NEXT_PUBLIC_BASE_URL,
		title: "Embedded Quiz",
		author_name: "QuizMaster AI",
		html: embedHtml,
		width: 600,
		height: 400,
	});
}
