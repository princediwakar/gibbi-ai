"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Quiz } from "@/types/quiz";

interface QuizCreatorProps {
	onQuizCreated: (quiz: Quiz) => void;
}

export const QuizCreator = ({
	onQuizCreated,
}: QuizCreatorProps) => {
	const [prompt, setPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const user = useUser();

	const handleGenerateQuiz = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();

			if (!prompt.trim()) {
				toast.error("Please enter a quiz topic");
				return;
			}

			if (!user) {
				toast.error(
					"You must be logged in to create quizzes"
				);
				return;
			}

			setIsLoading(true);
			const toastId = toast.loading(
				"Starting quiz generation..."
			);

			try {
				// Step 1: Generating quiz with AI
				toast.loading(
					"Generating quiz content with AI...",
					{ id: toastId }
				);
				const response = await fetch(
					"/api/quiz/create",
					{
						method: "POST",
						headers: {
							"Content-Type":
								"application/json",
							Authorization: `Bearer ${user.access_token}`,
						},
						body: JSON.stringify({
							prompt,
							creator_id: user.id,
						}),
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.error ||
							"Failed to create quiz"
					);
				}

				// Step 2: Processing quiz data
				toast.loading("Processing quiz data...", {
					id: toastId,
				});
				const data = await response.json();

				// Step 3: Success
				toast.success(
					`Quiz "${data.quiz.title}" created successfully!`,
					{ id: toastId }
				);
				onQuizCreated(data.quiz);
			} catch (error) {
				console.error(
					"Quiz creation failed:",
					error
				);
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to generate quiz",
					{ id: toastId }
				);
			} finally {
				setIsLoading(false);
				setPrompt("");
			}
		},
		[prompt, user, onQuizCreated]
	);

	return (
		<div className="space-y-4">
			<h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
				Create Your Quiz
			</h2>
			<form
				className="space-y-6 max-w-2xl mx-auto"
				onSubmit={handleGenerateQuiz}
			>
				<div className="relative">
					<Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<Input
						type="text"
						className="h-12 pl-10"
						value={prompt}
						onChange={(e) =>
							setPrompt(e.target.value)
						}
						placeholder="Enter a quiz topic..."
						disabled={isLoading}
					/>
				</div>
				<Button
					type="submit"
					disabled={isLoading}
					className="w-full h-12"
				>
					{isLoading ? (
						<div className="flex items-center gap-2">
							<Loader2 className="h-5 w-5 animate-spin" />
							Generating your quiz...
						</div>
					) : (
						"Generate Quiz"
					)}
				</Button>
			</form>
		</div>
	);
};
