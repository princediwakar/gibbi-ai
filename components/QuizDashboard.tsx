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

	// Stable fetch function using useCallback
    const fetchQuizzes = useCallback(async () => {
		if (!user) {
			setQuizzes([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		try {
			const { data, error } = await supabase
				.from("quizzes")
				.select("*")
				.eq("creator_id", user.id)
				.neq("status", "failed") // Exclude failed quizzes
				.order("created_at", { ascending: false })
				.limit(10);

			if (error) throw error;
			setQuizzes(data as Quiz[]);
		} catch (error: unknown) {
			console.error("Error fetching quizzes:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to load quizzes";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	// Fetch quizzes when user.id changes
	useEffect(() => {
		fetchQuizzes();
	}, [fetchQuizzes]);

	// Handle quiz creation
	const handleQuizCreated = useCallback((quiz: Quiz) => {
		setQuizzes((prev) => [quiz, ...prev]);
	}, []);

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
