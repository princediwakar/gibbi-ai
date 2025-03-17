import { NextRequest, NextResponse } from "next/server";
import { createQuizWithAI } from "@/lib/ai";
import { supabase } from "@/lib/supabase/client";
import { Quiz } from "@/types/quiz"; // Add this import

// const MAX_PENDING_TIME = Number(
// 	process.env.MAX_PENDING_TIME
// ); 
// const DEFAULT_QUESTION_COUNT = Number(
// 	process.env.NEXT_PUBLIC_DEFAULT_QUESTION_COUNT || 10
// );
// const DEFAULT_DIFFICULTY = Number(
// 	process.env.NEXT_PUBIC_DEFAULT_DIFFICULTY || "Hard"
// );

const MAX_PENDING_TIME = 300000;
const DEFAULT_QUESTION_COUNT = 10
const DEFAULT_DIFFICULTY = "Hard"
// QUIZ CREATION API

export async function POST(req: NextRequest) {
	try {
    const {
		prompt,
		creator_id,
		question_count,
		difficulty,
		custom_instructions,
	} = await req.json();

		if (!prompt) {
			return NextResponse.json(
				{ error: "Prompt is required" },
				{ status: 400 }
			);
		}
		if (!creator_id) {
			return NextResponse.json(
				{ error: "User authentication required" },
				{ status: 401 }
			);
		}

		// Create pending quiz entry
		const { data: quiz, error: quizError } =
			await supabase
				.from("quizzes")
				.insert({
					title: "Generating...",
					description:
						"Your quiz is being generated",
					status: "pending",
					creator_id,
					topic: "Generating...", // Add default topic
					subject: "...Generating...", // Add default subject
					difficulty: difficulty || DEFAULT_DIFFICULTY, // Add default difficulty
				})
				.select("quiz_id")
				.single();


		if (quizError) {
			throw new Error(
				`Quiz insert failed: ${quizError.message}`
			);
		}

		// Start background processing
		processQuizInBackground(
			quiz.quiz_id,
			prompt,
			question_count || DEFAULT_QUESTION_COUNT,
			difficulty || DEFAULT_DIFFICULTY,
			custom_instructions
		);

		return NextResponse.json({
			quiz_id: quiz.quiz_id,
			status: "pending",
		});
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Internal Server Error",
			},
			{ status: 500 }
		);
	}
}






async function processQuizInBackground(
	quizId: string,
	prompt: string,
	questionCount?: number,
	difficulty?: string,
	customInstructions?: string
) {
	const startTime = Date.now();
	let success = false;

	try {
		// Generate quiz data using AI with timeout
		const quizData = await Promise.race<Quiz>([
			createQuizWithAI(
				prompt,
				questionCount,
				difficulty,
				customInstructions
			),
			new Promise<never>((_, reject) =>
				setTimeout(
					() =>
						reject(
							new Error("Processing timeout")
						),
					MAX_PENDING_TIME
				)
			),
		]);

		// Update quiz with generated data
		await supabase
			.from("quizzes")
			.update({
				title: quizData.title,
				description: quizData.description,
				subject: quizData.subject,
				topic: quizData.topic,
				difficulty: quizData.difficulty,
				status: "ready",
			})
			.eq("quiz_id", quizId);

		// Insert questions
		const questionsInsert = quizData.questions.map(
			(q) => ({
				quiz_id: quizId,
				question_text: q.question_text,
				options: q.options,
				correct_option: q.correct_option,
			})
		);

		await supabase
			.from("questions")
			.insert(questionsInsert);

		success = true;
		console.log(
			`Quiz ${quizId} processed successfully`
		);
	} catch (error) {
		console.error(
			`Error processing quiz ${quizId}:`,
			error
		);

		// Mark as failed if timeout or other error occurs
		await supabase
			.from("quizzes")
			.update({
				status: "failed",
				error_message:
					error instanceof Error
						? error.message
						: "Unknown error",
			})
			.eq("quiz_id", quizId);
	} finally {
		if (!success) {
			const elapsedTime = Date.now() - startTime;
			console.log(
				`Quiz ${quizId} failed after ${elapsedTime}ms`
			);
		}
	}
}