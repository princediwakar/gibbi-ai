import { NextRequest, NextResponse } from "next/server";
import { createQuizWithAI } from "@/lib/ai";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
	try {
		const { prompt, creator_id } = await req.json();

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
					subject: "Generating...", // Add default subject
					difficulty: "Generating...", // Add default difficulty
					num_questions: 0, // Will be updated later
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
) {
	try {
		// Generate quiz data using AI
		const quizData = await createQuizWithAI(prompt);

		// Update quiz with generated data
		await supabase
			.from("quizzes")
			.update({
				title: quizData.title,
				description: quizData.description,
				subject: quizData.subject,
				topic: quizData.topic,
				difficulty: quizData.difficulty,
				num_questions: quizData.num_questions,
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

		console.log(
			`Quiz ${quizId} processed successfully`
		);
	} catch (error) {
		console.error(
			`Error processing quiz ${quizId}:`,
			error
		);
		await supabase
			.from("quizzes")
			.update({ status: "failed" })
			.eq("quiz_id", quizId);
	}
}