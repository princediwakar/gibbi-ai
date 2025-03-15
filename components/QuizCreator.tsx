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

const checkQuizStatus = useCallback(
	async (quizId: string, toastId: string | number) => {
		try {
			const response = await fetch(
				`/api/quiz/status?id=${quizId}`
			);
			const data = await response.json();

			if (data.status === "ready") {
				toast.success(
					"Quiz generated successfully!",
					{ id: toastId }
				);
				onQuizCreated(data.quiz);
			} else if (data.status === "failed") {
				toast.error(
					data.error ||
						"Quiz generation failed. Please try again.",
					{ id: toastId }
				);
				// Remove failed quiz from the list
				onQuizCreated({
					quiz_id: quizId,
					status: "failed",
				} as Quiz);
			} else {
				toast.loading(
					`Generating quiz for ${prompt}`,
					{ id: toastId }
				);
				setTimeout(
					() => checkQuizStatus(quizId, toastId),
					5000
				);
			}
		} catch (error) {
			console.error("Polling error:", error);
			toast.error("Failed to check quiz status", {
				id: toastId,
			});
		}
	},
	[onQuizCreated, prompt]
);
	const handleGenerateQuiz = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();
			if (!user || !prompt.trim()) return;

			setIsLoading(true);
			const toastId = toast.loading(
				"Starting quiz generation..."
			);

			try {
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

				const data = await response.json();
				if (!response.ok)
					throw new Error(
						data.error ||
							"Failed to create quiz"
					);

				// Store the cleanup function from checkQuizStatus
				const cleanup = checkQuizStatus(
					data.quiz_id,
					toastId
				);

				// Return cleanup function to be called if component unmounts
				return cleanup;
			} catch (error) {
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
		[prompt, user, checkQuizStatus]
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
