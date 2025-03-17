import { supabase } from "./supabase/client";
import { Quiz } from "@/types/quiz";

// Local cache for creator names
const creator_nameCache = new Map<string, string>();

async function getcreator_name(
	creatorId: string
): Promise<string> {
	// Check cache first
	if (creator_nameCache.has(creatorId)) {
		return creator_nameCache.get(creatorId)!;
	}

	// Fetch user data
	const { data: user, error } =
		await supabase.auth.admin.getUserById(creatorId);

	if (error || !user) {
		console.error(
			"Error fetching creator data:",
			error
		);
		return "Anonymous";
	}

	// Determine display name
	const displayName =
		user.user.user_metadata?.full_name ||
		user.user.user_metadata?.name ||
		user.user.email?.split("@")[0] ||
		"Anonymous";

	// Cache the result
	creator_nameCache.set(creatorId, displayName);
	return displayName;
}


export async function getPublicQuizzes(): Promise<Quiz[]> {
	try {

		// Get all public quizzes without status filter
		const { data: quizzes, error: quizzesError } =
			await supabase
				.from("quiz_with_counts")
				.select("*")
				.eq("is_public", true)
				.eq("status", "ready")
				.order("created_at", { ascending: false });

		if (quizzesError) {
			console.error(
				"Error fetching public quizzes:",
				quizzesError
			);
			return [];
		}


		// If no quizzes found, return empty array
		if (!quizzes || quizzes.length === 0) {
			console.log("No quizzes found in database");
			return [];
		}

		// Get unique creator IDs
		const creatorIds = [
			...new Set(quizzes.map((q) => q.creator_id)),
		];

		// Fetch creator names in parallel
		const creatorNames = await Promise.all(
			creatorIds.map((id) => getcreator_name(id))
		);

		// Create a map of user ID to display name
		const userMap = new Map(
			creatorIds.map((id, index) => [
				id,
				creatorNames[index],
			])
		);

		// Map quizzes with creator names and ensure proper typing
		const result = quizzes.map((quiz) => ({
			...quiz,
			creator_name:
				userMap.get(quiz.creator_id) || "Anonymous",
			status: quiz.status || "ready",
		}));

		return result;
	} catch (error) {
		console.error("Error in getPublicQuizzes:", error);
		return [];
	}
}



export async function deleteQuiz(
	quizId: string,
	userId: string
): Promise<void> {
	try {
		// Verify ownership
		const { data: quiz, error: fetchError } =
			await supabase
				.from("quizzes")
				.select("creator_id")
				.eq("quiz_id", quizId)
				.single();

		if (fetchError || !quiz) {
			throw new Error("Quiz not found");
		}

		if (quiz.creator_id !== userId) {
			throw new Error(
				"You don't have permission to delete this quiz"
			);
		}

		// Delete the quiz (questions will be deleted automatically)
		const { error: deleteError } = await supabase
			.from("quizzes")
			.delete()
			.eq("quiz_id", quizId);

		if (deleteError) {
			throw new Error("Failed to delete quiz");
		}
	} catch (error) {
		console.error("Error in deleteQuiz:", error);
		throw error;
	}
}




export async function getUserName(
	userId: string
): Promise<string> {
	try {
		const {
			data: { user },
			error,
		} = await supabase.auth.admin.getUserById(userId);

		if (error) {
			console.error("Supabase auth error:", error);
			return "Anonymous";
		}

		return (
			user?.user_metadata?.display_name ||
			user?.user_metadata?.full_name ||
			user?.email?.split("@")[0] ||
			"Anonymous"
		);
	} catch (error) {
		console.error(
			"Error fetching user details:",
			error
		);
		return "Anonymous";
	}
}



// export async function getQuizWithQuestions(
// 	quizId: string
// ): Promise<Quiz | null> {
// 	try {
// 		const quiz = await getQuizMetadata(quizId);
// 		if (!quiz) return null;

// 		const { data: questions, error } = await supabase
// 			.from("questions")
// 			.select("*")
// 			.eq("quiz_id", quizId);

// 		if (error) {
// 			console.error(
// 				"Error fetching questions:",
// 				error
// 			);
// 			return null;
// 		}
// 		const question_count = questions.length
// 		return {
// 			...quiz,
// 			question_count,
// 			questions: questions || [],
// 		};
// 	} catch (error) {
// 		console.error(
// 			"Error fetching quiz with questions:",
// 			error
// 		);
// 		return null;
// 	}
// }



export async function getQuizWithQuestions(
	quizId: string
): Promise<Quiz | null> {
	try {
		// Fetch quiz metadata from the view
		const { data: quiz, error: quizError } =
			await supabase
				.from("quiz_with_counts") // ✅ Use the view
				.select("*")
				.eq("quiz_id", quizId)
				.single();

		if (quizError || !quiz) return null;

		const creator_name = getUserName(quiz.creator_id)

		// Fetch questions separately
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
			return null;
		}
		

		return {
			...quiz,
			creator_name,
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



export async function getQuizMetadata(
	quizId: string
): Promise<Quiz | null> {
	try {
		const { data: quiz, error } = await supabase
			.from("quiz_with_counts") // ✅ Use the view
			.select("*")
			.eq("quiz_id", quizId)
			.single();

		if (error || !quiz) return null;
		const creator_name = getUserName(quiz.creator_id);

		return {...quiz, creator_name}; // ✅ No need to manually fetch creator_name if it's in the view
	} catch (error) {
		console.error(
			"Error fetching quiz metadata:",
			error
		);
		return null;
	}
}




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
