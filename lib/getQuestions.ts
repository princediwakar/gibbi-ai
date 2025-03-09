import { supabase } from "./supabase/client";

export async function getQuestions(quizId: string) {
	try {
		
		const { data: questions } = await supabase
			.from("questions")
			.select("*")
			.eq("quiz_id", quizId);

		return {
			questions: questions || [],
		};
	} catch (error) {
		console.error("Error fetching questions:", error);
		return null;
	}
}
