"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Quiz } from "@/types/quiz";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	ChevronDown,
	ChevronUp,
	Settings,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


interface QuizCreatorProps {
	onQuizCreated: (quiz: Quiz) => void;
}

const defaultQuestionCount = Number(process.env.DEFAULT_QUESTION_COUNT)
const defaultDifficulty = process.env.DEFAULT_DIFFICULTY

export const QuizCreator = ({
	onQuizCreated,
}: QuizCreatorProps) => {
	const [prompt, setPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] =
		useState(false);
	const [numQuestions, setNumQuestions] = useState(
		defaultQuestionCount
	);
	const [difficulty, setDifficulty] = useState(
		defaultDifficulty
	);
	const [customInstructions, setCustomInstructions] =
		useState("");
	const user = useUser();

	const checkQuizStatus = useCallback(
		async (
			quizId: string,
			toastId: string | number
		) => {
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
						() =>
							checkQuizStatus(
								quizId,
								toastId
							),
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
			setIsSettingsOpen(false); // Add this line to close settings

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
							num_questions: numQuestions,
							difficulty: difficulty,
							custom_instructions: customInstructions
						
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
		[
			prompt,
			user,
			numQuestions,
			difficulty,
			customInstructions,
			checkQuizStatus,
		]
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

				{/* Settings Collapsible */}
				<Collapsible
					open={isSettingsOpen}
					onOpenChange={setIsSettingsOpen}
				>
					<CollapsibleTrigger className="w-full">
						<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
							<Settings className="w-4 h-4" />
							<span>Advanced Settings</span>
							{isSettingsOpen ? (
								<ChevronUp className="w-4 h-4" />
							) : (
								<ChevronDown className="w-4 h-4" />
							)}
						</div>
					</CollapsibleTrigger>
					<CollapsibleContent className="space-y-4 mt-4">
						{/* Number of Questions */}
						<div className="space-y-2">
							<Label>
								Number of Questions
							</Label>
							<Select
								value={numQuestions.toString()}
								onValueChange={(value) =>
									setNumQuestions(
										Number(value)
									)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select number of questions" />
								</SelectTrigger>
								<SelectContent>
									{[
										5, 10, 15, 20, 25,
										30,
									].map((num) => (
										<SelectItem
											key={num}
											value={num.toString()}
										>
											{num} questions
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Difficulty Level */}
						<div className="space-y-2">
							<Label>Difficulty Level</Label>
							<Select
								value={difficulty}
								onValueChange={(value) =>
									setDifficulty(value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select difficulty" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Easy">
										Easy
									</SelectItem>
									<SelectItem value="Medium">
										Medium
									</SelectItem>
									<SelectItem value="Hard">
										Hard
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Custom Instructions */}
						<div className="space-y-2">
							<Label>
								Custom Instructions
							</Label>
							<Textarea
								value={customInstructions}
								onChange={(e) =>
									setCustomInstructions(
										e.target.value
									)
								}
								placeholder="E.g., 'Focus on practical examples', 'Use medical terminology', etc."
								className="min-h-[100px]"
							/>
						</div>
					</CollapsibleContent>
				</Collapsible>

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