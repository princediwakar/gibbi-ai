import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const quizId = searchParams.get("quizId");

	if (!quizId) {
		return NextResponse.json(
			{ error: "Quiz ID is required" },
			{ status: 400 }
		);
	}

	return NextResponse.redirect(
		`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${quizId}/screenshot`
	);
}
