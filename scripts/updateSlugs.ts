import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const NEXT_PUBLIC_SUPABASE_URL =
	"https://ppbiycqjoravxsyebmfs.supabase.co";
const NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYml5Y3Fqb3JhdnhzeWVibWZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTgyMTg1OCwiZXhwIjoyMDU1Mzk3ODU4fQ.mm0cKPTSqiZVyPx92gT6d8v7ZyXiIqDjes5G4zrh_zs";

export const supabase = createClient(
	NEXT_PUBLIC_SUPABASE_URL,
	NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);


function generateSlug(title: string, quizId: string) {
	// Generate the slug using underscore as a separator
	const slug = `${title
		.replace(/\s+/g, "-")
		.toLowerCase()}_${quizId}`;

	return slug;
}

async function updateSlugsForExistingQuizzes() {
	// Fetch all existing quizzes
	const { data: quizzes, error } = await supabase
		.from("quizzes")
		.select("quiz_id, title, slug"); // Select the necessary columns

	if (error) {
		throw new Error("Error fetching quizzes");
	}

	// Loop through each quiz and update its slug
	for (const quiz of quizzes) {
		const { title, quiz_id: quiz_id } = quiz;

		// Generate a new slug
		const newSlug = generateSlug(title, quiz_id);

		// Update the quiz with the new slug
		const { error: updateError } = await supabase
			.from("quizzes")
			.update({ slug: newSlug })
			.eq("quiz_id", quiz_id); // Use quiz_id to match

		if (updateError) {
			console.error(
				`Error updating slug for quiz ${quiz_id}:`,
				updateError
			);
		} else {
			console.log(
				`Slug updated for quiz ${quiz_id}: ${newSlug}`
			);
		}
	}
}

// Run the function
updateSlugsForExistingQuizzes()
	.then(() => console.log("Slugs updated successfully!"))
	.catch((error) =>
		console.error("Error updating slugs:", error)
	);
