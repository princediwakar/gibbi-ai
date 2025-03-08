import { supabase } from "./supabase/client";

export async function getUserDetails(userId: string) {
	try {
		// Use auth.admin.getUser() for server-side requests
		const {
			data: { user },
			error,
		} = await supabase.auth.admin.getUserById(userId);

		if (error) throw error;

		// Get display name from user metadata
		const displayName =
			user?.user_metadata?.display_name ||
			user?.user_metadata?.full_name ||
			user?.email?.split("@")[0] ||
			"Anonymous";

		return displayName;
	} catch (error) {
		console.error(
			"Error fetching user details:",
			error
		);
		return "Anonymous";
	}
}
