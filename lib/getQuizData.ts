import { getUserDetails } from "./getUserDetails";
import { supabase } from "./supabase/client";

export async function getQuizData(quizId: string) {
	try {
		const { data: quiz, error: quizError } =
			await supabase
				.from("quizzes")
				.select("*")
				.eq("quiz_id", quizId)
				.single();

		if (quizError || !quiz) return null;

		const creatorName = await getUserDetails(
			quiz.creator_id
		);
		const { data: questions } = await supabase
			.from("questions")
			.select("*")
			.eq("quiz_id", quizId);

		return {
			quiz,
			creatorName,
			questions: questions || [],
		};
	} catch (error) {
		console.error("Error fetching quiz data:", error);
		return null;
	}
}
