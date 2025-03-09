import { getQuizMetadata } from "./getQuizMetadata";
import { supabase } from "./supabase/client";
import { Quiz } from "@/types/quiz";

export async function getQuizWithQuestions(
	quizId: string
): Promise<Quiz | null> {
	try {
		const quiz = await getQuizMetadata(quizId);
		if (!quiz) return null;

		const { data: questions, error } = await supabase
			.from("questions")
			.select("*")
			.eq("quiz_id", quizId);

		if (error) {
			console.error(
				"Error fetching questions:",
				error
			);
			return null;
		}

		return {
			...quiz,
			questions: questions || [],
		};
	} catch (error) {
		console.error(
			"Error fetching quiz with questions:",
			error
		);
		return null;
	}
}
