"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
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
	const user = useUser();
	const [prompt, setPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleGenerateQuiz = async () => {
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

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				throw new Error("No active session found");
			}

			toast.promise(
				(async () => {
					const response = await fetch(
						"/api/quiz/create",
						{
							method: "POST",
							headers: {
								"Content-Type":
									"application/json",
								Authorization: `Bearer ${session.access_token}`,
							},
							body: JSON.stringify({
								prompt,
								creator_id: user.id,
							}),
						}
					);

					if (!response.ok) {
						const errorData = await response
							.json()
							.catch(() => ({}));
						throw new Error(
							errorData.message ||
								`API Error: ${response.statusText}`
						);
					}

					const data = await response.json();

					if (!data?.quiz_id) {
						throw new Error(
							"Invalid quiz data received from server"
						);
					}

					const { quiz_id } = data;
					const { data: newQuiz, error } =
						await supabase
							.from("quizzes")
							.select("*")
							.eq("quiz_id", quiz_id)
							.single();

					if (error) {
						throw new Error(
							"Failed to fetch quiz details from database"
						);
					}

					onQuizCreated(newQuiz);
					return newQuiz;
				})(),
				{
					loading: "Generating your quiz...",
					success: (newQuiz) =>
						`Quiz "${newQuiz.title}" created successfully!`,
					error: (error) =>
						`Failed to generate quiz: ${error.message}`,
				}
			);
		} catch (error: unknown) {
			console.error("Quiz generation failed:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to generate quiz. Please try again.";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
			setPrompt("");
		}
	};

	return (
		<div className="space-y-4">
			<h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
				Create Your Quiz
			</h2>
			<div className="space-y-6 max-w-2xl mx-auto">
				<div className="relative">
					<Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<Input
						value={prompt}
						onChange={(e) =>
							setPrompt(e.target.value)
						}
						placeholder="Enter a quiz topic..."
						className="h-12 text-lg pl-10"
					/>
				</div>

				<Button
					onClick={handleGenerateQuiz}
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
			</div>
		</div>
	);
};
