import { NextRequest, NextResponse } from "next/server";
import { createQuizWithAI } from "@/lib/ai";
import { supabase } from "@/lib/supabase/client";

interface Question {
	question_text: string;
	options: Record<string, string>;
	correct_option: string;
}

export async function POST(req: NextRequest) {
	try {
		// Validate request body
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

		// Generate quiz data using AI
		const quizData = await createQuizWithAI(prompt);

		// Prepare quiz data for insertion
		const quizInsert = {
			title: quizData.title,
			description: quizData.description,
			subject: quizData.subject,
			topic: quizData.topic,
			difficulty: quizData.difficulty,
			num_questions: quizData.num_questions,
			is_public: true,
			creator_id,
		};

		// Insert quiz record and select necessary columns
		const { data: quiz, error: quizError } =
			await supabase
				.from("quizzes")
				.insert(quizInsert)
				.select(
					"quiz_id, title, description, subject, topic, difficulty, num_questions, created_at"
				)
				.single();

		if (quizError) {
			throw new Error(
				`Quiz insert failed: ${quizError.message}`
			);
		}

		const quizId = quiz.quiz_id;

		// Prepare questions for bulk insertion
		const questionsInsert = quizData.questions.map(
			(q: Question) => ({
				quiz_id: quizId,
				question_text: q.question_text,
				options: q.options,
				correct_option: q.correct_option,
			})
		);

		// Batch insert questions
		const { error: questionsError } = await supabase
			.from("questions")
			.insert(questionsInsert);

		if (questionsError) {
			console.error(
				"Rolling back quiz insert due to question insert failure."
			);
			await supabase
				.from("quizzes")
				.delete()
				.eq("quiz_id", quizId);
			throw new Error(
				`Questions insert failed: ${questionsError.message}`
			);
		}

		// Return the complete quiz data
		return NextResponse.json({
			quiz: {
				...quiz,
				questions: questionsInsert,
			},
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
