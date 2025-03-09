"use client";

import { useState, useEffect } from "react";
import { QuizCreator } from "./QuizCreator";
import { QuizGallery } from "./QuizGallery";
import { Quiz } from "@/types/quiz";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function QuizDashboard() {
	const [quizzes, setQuizzes] = useState<Quiz[] | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchQuizzes = async () => {
			if (quizzes !== null) return; // Prevent refetch if quizzes already exist

			setIsLoading(true);
			try {
				const { data, error } = await supabase
					.from("quizzes")
					.select("*")
					.order("created_at", {
						ascending: false,
					})
					;

				if (error) throw error;

				setQuizzes(data as Quiz[]);
				// toast.success(
				// 	"Quizzes loaded successfully!"
				// );
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
	}, [quizzes]);

	const handleQuizCreated = (quiz: Quiz) => {
		setQuizzes((prev) =>
			prev ? [quiz, ...prev] : [quiz]
		);
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
