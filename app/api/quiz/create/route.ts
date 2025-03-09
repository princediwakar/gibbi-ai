import { NextRequest, NextResponse } from "next/server";
import { createQuizWithAI } from "@/lib/openai";
import { supabase } from "@/lib/supabase/client";

interface Question {
	question_text: string;
	options: Record<string, string>;
	correct_option: string;
}


export async function POST(req: NextRequest) {
	try {
		console.log("Received quiz creation request");

		const { prompt, creator_id } = await req.json();
		console.log("Prompt received:", prompt);

		if (!prompt) {
			console.error("Prompt is required");
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

		// Generate quiz with AI
		console.log("Generating quiz with AI...");
		const quizData = await createQuizWithAI(prompt);
		console.log("Quiz data generated:", quizData);

		// Insert quiz into Supabase
		console.log("Inserting quiz into database...");
		const { data: quiz, error: quizError } =
			await supabase
				.from("quizzes")
				.insert([
					{
						title: quizData.title,
						description: quizData.description,
						subject: quizData.subject,
						topic: quizData.topic,
						difficulty: quizData.difficulty,
						num_questions:
							quizData.num_questions,
						is_public: true,
						creator_id: creator_id,
					},
				])
				.select("quiz_id")
				.single();

		if (quizError) {
			console.error(
				"Supabase quiz insert error:",
				quizError
			);
			return NextResponse.json(
				{
					error:
						"Failed to create quiz: " +
						quizError.message,
				},
				{ status: 500 }
			);
		}

		const quiz_id = quiz.quiz_id;
		console.log("Quiz inserted with ID:", quiz_id);

		// Insert questions
		console.log("Inserting questions...");
		// Update the map function to use proper typing
		const { error: questionsError } = await supabase
			.from("questions")
			.insert(
				quizData.questions.map((q: Question) => ({
					quiz_id,
					question_text: q.question_text,
					options: JSON.stringify(q.options),
					correct_option: q.correct_option,
				}))
			);

		if (questionsError) {
			console.error(
				"Supabase questions insert error:",
				questionsError
			);

			// Clean up the quiz if questions failed to insert
			await supabase
				.from("quizzes")
				.delete()
				.eq("quiz_id", quiz_id);

			return NextResponse.json(
				{
					error:
						"Failed to create quiz questions: " +
						questionsError.message,
				},
				{ status: 500 }
			);
		}

		console.log("Quiz created successfully");
		return NextResponse.json({
			quiz_id,
			message: "Quiz created successfully!",
		});
	} catch (error: unknown) {
		console.error("API error:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Internal Server Error";
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
