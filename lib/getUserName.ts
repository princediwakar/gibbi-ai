import { supabase } from "./supabase/client";

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
