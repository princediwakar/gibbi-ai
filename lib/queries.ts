import { supabase } from "./supabase/client";
import { Quiz } from "@/types/quiz";

// Local cache for creator names
const creatorNameCache = new Map<string, string>();

async function getCreatorName(
	creatorId: string
): Promise<string> {
	// Check cache first
	if (creatorNameCache.has(creatorId)) {
		return creatorNameCache.get(creatorId)!;
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
	creatorNameCache.set(creatorId, displayName);
	return displayName;
}

export async function getPublicQuizzes(): Promise<Quiz[]> {
	// First get all public quizzes
	const { data: quizzes, error: quizzesError } =
		await supabase
			.from("quizzes")
			.select("*")
			.eq("is_public", true)
			.order("created_at", { ascending: false });

	if (quizzesError) {
		console.error(
			"Error fetching public quizzes:",
			quizzesError
		);
		return [];
	}

	// Get unique creator IDs
	const creatorIds = [
		...new Set(quizzes.map((q) => q.creator_id)),
	];

	// Fetch creator names in parallel
	const creatorNames = await Promise.all(
		creatorIds.map((id) => getCreatorName(id))
	);

	// Create a map of user ID to display name
	const userMap = new Map(
		creatorIds.map((id, index) => [
			id,
			creatorNames[index],
		])
	);

	// Map quizzes with creator names
	return quizzes.map((quiz) => ({
		...quiz,
		creatorName:
			userMap.get(quiz.creator_id) || "Anonymous",
	}));
}
