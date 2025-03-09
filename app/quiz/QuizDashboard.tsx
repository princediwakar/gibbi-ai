"use client";

import { useState, useEffect } from "react";
import { QuizCreator } from "./QuizCreator";
import { QuizGallery } from "./QuizGallery";
import { Quiz } from "@/types/quiz";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function QuizDashboard() {
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [isLoading, setIsLoading] =
		useState<boolean>(true);

	useEffect(() => {
		// Update the fetchQuizzes function
		const fetchQuizzes = async () => {
			setIsLoading(true);
			try {
				toast.promise(
					(async () => {
						const { data, error } =
							await supabase
								.from("quizzes")
								.select(
									"quiz_id, title, description, topic, subject, difficulty, num_questions, created_at, updated_at, is_public, creator_id"
								)
								.order("created_at", {
									ascending: false,
								});

						if (error) throw error;
						setQuizzes((data as Quiz[]) || []);
					})(),
					{
						loading: "Loading quizzes...",
						success:
							"Quizzes loaded successfully!",
						error: (error) =>
							`Failed to load quizzes: ${error.message}`,
					}
				);
			} catch (error: unknown) {
				console.error(
					"Error fetching quizzes:",
					error
				);
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to load quizzes";
				toast.error(errorMessage);
			} finally {
				setIsLoading(false);
			}
		};

		fetchQuizzes();
	}, []);

	const handleQuizCreated = (quiz: Quiz) => {
		setQuizzes([quiz, ...quizzes]);
		toast.success(
			`Quiz "${quiz.title}" created successfully!`
		);
	};

	return (
		<div className="max-w-4xl mx-auto space-y-24 p-4">
			<QuizCreator
				onQuizCreated={handleQuizCreated}
			/>
			<QuizGallery
				savedQuizzes={quizzes}
				isLoading={isLoading}
			/>
		</div>
	);
}
