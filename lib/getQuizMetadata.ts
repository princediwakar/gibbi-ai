import { getUserName } from "./getUserName";
import { supabase } from "./supabase/client";
import { Quiz } from "@/types/quiz";

export async function getQuizMetadata(
	quizId: string
): Promise<Quiz | null> {
	try {
		const { data: quiz, error } = await supabase
			.from("quizzes")
			.select("*")
			.eq("quiz_id", quizId)
			.single();

		if (error || !quiz) return null;

		const creatorName = await getUserName(
			quiz.creator_id
		);
		return {
			...quiz,
			creatorName,
		};
	} catch (error) {
		console.error(
			"Error fetching quiz metadata:",
			error
		);
		return null;
	}
}
