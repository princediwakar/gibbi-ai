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
const MAX_QUESTION_COUNT = 60;
const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_DIFFICULTY = "Hard";
const STATUS_CHECK_FREQUENCY = 10000;

export const QuizCreator = ({
	onQuizCreated,
}: QuizCreatorProps) => {
	const [prompt, setPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] =
		useState(false);
	const [questionCount, setQuestionCount] = useState(
		DEFAULT_QUESTION_COUNT
	);
	const [isCustomCount, setIsCustomCount] =
		useState(false);

	const [difficulty, setDifficulty] = useState(
		DEFAULT_DIFFICULTY
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
						STATUS_CHECK_FREQUENCY
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

	const handleCustomCountChange = (value: string) => {
		const num = parseInt(value, 10);

		if (isNaN(num) || num < 0) {
			toast.warning(
				"Please enter a valid number greater than 0"
			);
			return;
		}

		if (num > MAX_QUESTION_COUNT) {
			toast.warning(
				`You can generate up to ${MAX_QUESTION_COUNT} questions only`
			);
			setQuestionCount(MAX_QUESTION_COUNT);
			return;
		}

		setQuestionCount(num);
	};

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
							question_count: questionCount,
							difficulty: difficulty,
							custom_instructions:
								customInstructions,
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
			questionCount,
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
							<div className="flex gap-2">
								<Select
									value={
										isCustomCount
											? "custom"
											: questionCount.toString()
									}
									onValueChange={(
										value
									) => {
										if (
											value ===
											"custom"
										) {
											setIsCustomCount(
												true
											);
										} else {
											setIsCustomCount(
												false
											);
											setQuestionCount(
												Number(
													value
												)
											);
										}
									}}
								>
									<SelectTrigger className="flex-1">
										<SelectValue placeholder="Select number of questions" />
									</SelectTrigger>
									<SelectContent>
										{[
											5, 10, 15, 20,
											25, 30, 35, 40,
											50, 60,
										].map((num) => (
											<SelectItem
												key={num}
												value={num.toString()}
											>
												{num}{" "}
												questions
											</SelectItem>
										))}
										<SelectItem value="custom">
											Custom
										</SelectItem>
									</SelectContent>
								</Select>
								{isCustomCount && (
									<Input
										type="number"
										min="1"
										max={MAX_QUESTION_COUNT.toString()}
										value={
											questionCount
										}
										onChange={(e) =>
											handleCustomCountChange(
												e.target
													.value
											)
										}
										className="w-24"
									/>
								)}
							</div>
							{isCustomCount && (
								<p className="text-xs text-muted-foreground">
									Enter a number between 1
									and {MAX_QUESTION_COUNT}
								</p>
							)}
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
