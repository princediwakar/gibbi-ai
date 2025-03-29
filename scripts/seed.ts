// seeds/seedCombinedQuizzes.ts

import { createQuizWithAI } from "../lib/ai-seed"; // AI generation function
import { Quiz } from "../types/quiz";
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const NEXT_PUBLIC_SUPABASE_URL =
	process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY =
	process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

export const supabase = createClient(
	NEXT_PUBLIC_SUPABASE_URL,
	NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

// Utility function to pick a random difficulty from the list
// const getRandomDifficulty = (): string => {
// 	const difficulties = ["Easy", "Medium", "Hard"];
// 	const index = Math.floor(
// 		Math.random() * difficulties.length
// 	);
// 	return difficulties[index];
// };

const CREATOR_ID = "ea96a744-4925-41e0-8e40-12c968362e8a";

// --------------------
// Quantitative Quiz Seeding
// --------------------
async function seedQuantitativeQuiz(iteration: number) {
	console.log(
		`\n[Quant] Generating quiz ${
			iteration + 1
		} of 20...`
	);
	const QUESTION_COUNT = 21;
	const difficulty = "Hard";
	const QUIZ_PROMPT = "GMAT Quantitative Reasoning 2025";

	// 1. Create a pending quiz entry
	const { data: quiz, error: quizError } = await supabase
		.from("quizzes")
		.insert({
			title: "Generating...",
			description: "Your quiz is being generated",
			status: "pending",
			creator_id: CREATOR_ID,
			topic: "Quantitative Reasoning",
			subject: "GMAT Quantitative Reasoning",
			difficulty: difficulty,
		})
		.select("quiz_id")
		.single();

	if (quizError) {
		throw new Error(
			`[Quant] Quiz insert failed: ${quizError.message}`
		);
	}

	// 2. Generate quiz data using AI
	const quizData: Quiz = await createQuizWithAI(
		QUIZ_PROMPT,
		QUESTION_COUNT,
		difficulty,
		"Create questions that can be asked in GMAT 2025 Quantitative Reasoning Exam"
	);

	// 3. Update the quiz with generated data
	const { error: updateError } = await supabase
		.from("quizzes")
		.update({
			title: quizData.title,
			description: quizData.description,
			topic: "Quantitative Reasoning",
			subject: "GMAT Quantitative Reasoning",
			difficulty: difficulty,
			status: "ready",
		})
		.eq("quiz_id", quiz.quiz_id);

	if (updateError) {
		throw new Error(
			`[Quant] Quiz update failed: ${updateError.message}`
		);
	}

	// 4. Insert generated questions
	const questionsInsert = quizData.questions.map((q) => ({
		quiz_id: quiz.quiz_id,
		question_text: q.question_text,
		options: q.options,
		correct_option: q.correct_option,
	}));

	const { error: questionError } = await supabase
		.from("questions")
		.insert(questionsInsert);

	if (questionError) {
		throw new Error(
			`[Quant] Questions insert failed: ${questionError.message}`
		);
	}

	console.log(
		`[Quant] Quiz ${quiz.quiz_id} generated and inserted successfully.`
	);
}

// --------------------
// Verbal Quiz Seeding
// --------------------
async function seedVerbalQuiz(iteration: number) {
	console.log(
		`\n[Verbal] Generating quiz ${
			iteration + 1
		} of 20...`
	);
	const QUESTION_COUNT = 23;
	const difficulty = "Hard";
	const QUIZ_PROMPT = "GMAT Verbal Reasoning 2025";

	// 1. Create a pending quiz entry
	const { data: quiz, error: quizError } = await supabase
		.from("quizzes")
		.insert({
			title: "Generating...",
			description: "Your quiz is being generated",
			status: "pending",
			creator_id: CREATOR_ID,
			topic: "Verbal Reasoning",
			subject: "GMAT Verbal Reasoning",
			difficulty: difficulty,
		})
		.select("quiz_id")
		.single();

	if (quizError) {
		throw new Error(
			`[Verbal] Quiz insert failed: ${quizError.message}`
		);
	}

	// 2. Generate quiz data using AI
	const quizData: Quiz = await createQuizWithAI(
		QUIZ_PROMPT,
		QUESTION_COUNT,
		difficulty,
		"Create the questions that truly represent GMAT 2025 Verbal Reasoning Exam"
	);

	// 3. Update the quiz with generated data
	const { error: updateError } = await supabase
		.from("quizzes")
		.update({
			title: quizData.title,
			description: quizData.description,
			topic: "Verbal Reasoning",
			subject: "GMAT Verbal Reasoning",
			difficulty: difficulty,
			status: "ready",
		})
		.eq("quiz_id", quiz.quiz_id);

	if (updateError) {
		throw new Error(
			`[Verbal] Quiz update failed: ${updateError.message}`
		);
	}

	// 4. Insert generated questions
	const questionsInsert = quizData.questions.map((q) => ({
		quiz_id: quiz.quiz_id,
		question_text: q.question_text,
		options: q.options,
		correct_option: q.correct_option,
	}));

	const { error: questionError } = await supabase
		.from("questions")
		.insert(questionsInsert);

	if (questionError) {
		throw new Error(
			`[Verbal] Questions insert failed: ${questionError.message}`
		);
	}

	console.log(
		`[Verbal] Quiz ${quiz.quiz_id} generated and inserted successfully.`
	);
}

// --------------------
// Main Seeding Function
// --------------------
async function seedCombinedQuizzes() {
	console.log("Starting combined GMAT quiz seeding...");

	// We'll seed 20 quizzes for each type.
	for (let i = 0; i < 20; i++) {
		try {
			await seedQuantitativeQuiz(i);
		} catch (error) {
			console.error(
				"Error seeding Quantitative quiz:",
				error
			);
		}

		try {
			await seedVerbalQuiz(i);
		} catch (error) {
			console.error(
				"Error seeding Verbal quiz:",
				error
			);
		}
	}
}

seedCombinedQuizzes()
	.then(() => {
		console.log("\nSeeding completed.");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Seeding failed:", error);
		process.exit(1);
	});
