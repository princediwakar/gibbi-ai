import { QuizPlayer } from "@/app/quiz/QuizPlayer";
import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { getUserDetails } from "@/lib/getUserDetails";

interface PageProps {
	params: { quizId: string };
}

export default async function QuizPage({
	params,
}: PageProps) {
	// Ensure we're working with the params object
	const {quizId} = await params

	if (!quizId) {
		return notFound();
	}

	try {
		// Fetch quiz data
		const { data: quiz, error: quizError } =
			await supabase
				.from("quizzes")
				.select("*")
				.eq("quiz_id", quizId)
				.single();

		if (quizError || !quiz) {
			return notFound();
		}

		// Fetch creator name
		const creatorName = await getUserDetails(
			quiz.creator_id
		);

		// Fetch questions
		const { data: questions, error: questionsError } =
			await supabase
				.from("questions")
				.select("*")
				.eq("quiz_id", quizId);

		if (questionsError) {
			console.error(
				"Error fetching questions:",
				questionsError
			);
			return notFound();
		}

		const quizWithQuestions = {
			...quiz,
			creatorName,
			questions: questions || [],
		};

		return (
			<div className="max-w-4xl mx-auto p-4">
				<QuizPlayer quiz={quizWithQuestions} />
			</div>
		);
	} catch (error) {
		console.error("Error in QuizPage:", error);
		return notFound();
	}
}
