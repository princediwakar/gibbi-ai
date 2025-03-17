// seeds/seedQuizzes.ts

import { createQuizWithAI } from "../lib/ai"; // AI generation function
// import { supabase } from "../lib/supabase/client"; // Supabase client
import { Quiz } from "../types/quiz";

import { createClient } from "@supabase/supabase-js";



const NEXT_PUBLIC_SUPABASE_URL='https://ppbiycqjoravxsyebmfs.supabase.co'
const NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYml5Y3Fqb3JhdnhzeWVibWZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTgyMTg1OCwiZXhwIjoyMDU1Mzk3ODU4fQ.mm0cKPTSqiZVyPx92gT6d8v7ZyXiIqDjes5G4zrh_zs'
export const supabase = createClient(
	NEXT_PUBLIC_SUPABASE_URL,
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

// Define constants – you can adjust these as needed
const QUESTION_COUNT = 23;
const DIFFICULTY = "Hard";
const QUIZ_PROMPT = "GMAT Verbal Reasoning 2025";

// Use a dummy creator id for seeding purposes (or an actual test user id)

// Main seeding function
async function seedQuizzes() {
	console.log("Starting quiz seeding...");

	for (let i = 0; i < 20; i++) {
		console.log(`\nGenerating quiz ${i + 1} of 20...`);

		try {
			// 1. Create a pending quiz entry in the database
			const { data: quiz, error: quizError } =
				await supabase
					.from("quizzes")
					.insert({
						title: "Generating...",
						description:
							"Your quiz is being generated",
						status: "pending",
						creator_id:
							"ea96a744-4925-41e0-8e40-12c968362e8a",
						topic: "GMAT Verbal Reasoning",
						subject: "GMAT",
						difficulty: DIFFICULTY,
					})
					.select("quiz_id")
					.single();

			if (quizError) {
				throw new Error(
					`Quiz insert failed: ${quizError.message}`
				);
			}

			// 2. Generate quiz data using the AI function
			// The prompt here is static (GMAT Verbal Reasoning) but you could customize it per quiz if needed
			const quizData: Quiz = await createQuizWithAI(
				QUIZ_PROMPT,
				QUESTION_COUNT,
				DIFFICULTY,
				"Create the questions that truly represents GMAT 2025 Verbal Reasoning Exam" // no custom instructions for seed data
			);

			// 3. Update the quiz record with the generated quiz data
			const { error: updateError } = await supabase
				.from("quizzes")
				.update({
					title: quizData.title,
					description: quizData.description,
					topic: "Verbal Reasoning",
					subject: "GMAT Verbal Reasoning",
					difficulty: 'Advanced',
					status: "ready",
				})
				.eq("quiz_id", quiz.quiz_id);

			if (updateError) {
				throw new Error(
					`Quiz update failed: ${updateError.message}`
				);
			}

			// 4. Insert each generated question into the "questions" table
			const questionsInsert = quizData.questions.map(
				(q) => ({
					quiz_id: quiz.quiz_id,
					question_text: q.question_text,
					options: q.options,
					correct_option: q.correct_option,
				})
			);

			const { error: questionError } = await supabase
				.from("questions")
				.insert(questionsInsert);

			if (questionError) {
				throw new Error(
					`Questions insert failed: ${questionError.message}`
				);
			}

			console.log(
				`Quiz ${quiz.quiz_id} generated and inserted successfully.`
			);
		} catch (error) {
			console.error("Error seeding quiz:", error);
		}
	}
}

// Run the seeding script
seedQuizzes()
	.then(() => {
		console.log("\nSeeding completed.");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Seeding failed:", error);
		process.exit(1);
	});
