"use client";

import { useState, useEffect, useCallback } from "react";
import { QuizCreator } from "./QuizCreator";
import { QuizGallery } from "./QuizGallery";
import { Quiz } from "@/types/quiz";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

export function QuizDashboard() {
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const user = useUser();

	const fetchQuizzes = useCallback(
		async (userId: string) => {
			setIsLoading(true);
			try {
				const { data, error } = await supabase
					.from("quiz_with_counts")
					.select("*")
					.eq("creator_id", userId)
					.eq("status", "ready")
					.order("created_at", {
						ascending: false,
					});

				if (error) throw error;
				setQuizzes(data as Quiz[]);
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
		},
		[]
	);

	useEffect(() => {
		if (user?.id) {
			fetchQuizzes(user.id);
		} else {
			setIsLoading(false); // Add this line to handle logged out state
		}
	}, [user?.id, fetchQuizzes]);

	// Handle quiz creation
	const handleQuizCreated = useCallback((quiz: Quiz) => {
		if (quiz.status === "failed") {
			// Filter out the failed quiz
			setQuizzes((prev) =>
				prev.filter(
					(q) => q.quiz_id !== quiz.quiz_id
				)
			);
		} else {
			// Add the new quiz to the list
			setQuizzes((prev) => [quiz, ...prev]);
		}
	}, []);

	const handleQuizDeleted = useCallback(
		(deletedQuizId: string) => {
			setQuizzes((prevQuizzes) =>
				prevQuizzes.filter(
					(quiz) => quiz.quiz_id !== deletedQuizId
				)
			);
		},
		[]
	);
	const handleQuizUpdated = useCallback(
		(updatedQuiz: Quiz) => {
			setQuizzes((prevQuizzes) =>
				prevQuizzes.map((quiz) =>
					quiz.quiz_id === updatedQuiz.quiz_id
						? updatedQuiz
						: quiz
				)
			);
		},
		[]
	);

	return (
		<div className="max-w-4xl mx-auto space-y-24 p-4">
			<QuizCreator
				onQuizCreated={handleQuizCreated}
			/>
			{user && (
				<QuizGallery
					savedQuizzes={quizzes}
					isLoading={isLoading}
					onQuizDeleted={handleQuizDeleted}
					onQuizUpdated={handleQuizUpdated}
				/>
			)}
		</div>
	);
}
