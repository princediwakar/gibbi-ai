"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types/quiz";
import { QuizResults } from "./QuizResults";
import Link from "next/link";
import { QuizDetails } from "./QuizDetails";

export const QuizPlayer = ({ quiz }: { quiz: Quiz }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [completed, setCompleted] = useState(false);
	// const [isLoading, setIsLoading] = useState(true);
	const [hasStarted, setHasStarted] = useState(false);
	const [userAnswers, setUserAnswers] = useState<{
		[key: number]: string;
	}>({});

	// useEffect(() => {
	// 	if (quiz.questions && quiz.questions.length > 0) {
	// 		setIsLoading(false);
	// 	}
	// }, [quiz]);

	if (!quiz) {
		return (
			<div className="text-center">
				<p>Quiz not found</p>
				<Link href="/">
					<Button
						className="w-full"
						variant="outline"
					>
						Back to Home 1
					</Button>
				</Link>
			</div>
		);
	}

	// if (isLoading) {
	// 	return (
	// 		<div className="text-center">
	// 			<Loader2 className="w-6 h-6 animate-spin mx-auto" />
	// 			<p className="text-sm text-muted-foreground mt-2">
	// 				Loading quiz...
	// 			</p>
	// 		</div>
	// 	);
	// }

	if (!hasStarted) {
		return (
			<div className="max-w-2xl mx-auto p-4">
				<QuizDetails
					quiz={quiz}
					onStart={() => setHasStarted(true)}
				/>
			</div>
		);
	}

	const getProgressPercentage = () => {
		return (
			((currentIndex + 1) / quiz.num_questions) * 100
		);
	};

	const parseOptions = (options: string) => {
		try {
			const parsed = JSON.parse(options);
			return Object.entries(parsed).map(
				([key, value]) => ({
					key,
					value,
				})
			);
		} catch (error) {
			console.error(
				"Failed to parse options:",
				error
			);
			return [];
		}
	};

	const handleAnswer = (option: string) => {
		if (!quiz.questions) return;

		// Store user's answer
		setUserAnswers((prev) => ({
			...prev,
			[currentIndex]: option,
		}));

		if (
			option ===
			quiz.questions[currentIndex].correct_option
		) {
			setScore(score + 1);
		}
		if (currentIndex + 1 < quiz.questions.length) {
			setCurrentIndex(currentIndex + 1);
		} else {
			setCompleted(true);
		}
	};

	const handleShareResults = () => {
		// Implement sharing functionality
		console.log("Sharing results...");
		// This could include:
		// - Generating a shareable link
		// - Creating a shareable image
		// - Copying results to clipboard
		// - Opening native share dialog
	};

	// if (isLoading) {
	// 	return (
	// 		<div className="text-center">
	// 			<Loader2 className="w-6 h-6 animate-spin mx-auto" />
	// 			<p className="text-sm text-muted-foreground mt-2">
	// 				Loading questions...
	// 			</p>
	// 		</div>
	// 	);
	// }

	if (!quiz.questions || quiz.questions.length === 0) {
		return (
			<div className="text-center">
				<p>No questions available for this quiz.</p>
				<Link href="/">
					<Button
						className="w-full"
						variant="secondary"
					>
						Back to Home 2
					</Button>
				</Link>
			</div>
		);
	}

	const currentQuestion = quiz.questions[currentIndex];
	const options = parseOptions(currentQuestion.options);

	return (
		<div className="max-w-xl mx-auto mt-10">
			{!completed && (
				<>
					{/* Progress Bar */}
					<div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
						<div
							className="bg-primary h-2.5 rounded-full"
							style={{
								width: `${getProgressPercentage()}%`,
							}}
						></div>
					</div>

					{/* Question Counter */}
					<div className="text-sm text-gray-600 mb-6">
						Question {currentIndex + 1} of{" "}
						{quiz.questions.length}
					</div>
				</>
			)}

			{completed ? (
				<QuizResults
					quiz={quiz}
					userAnswers={userAnswers}
					score={score}
					onShare={handleShareResults}
				/>
			) : (
				<div className="space-y-6">
					<div className="text-lg font-medium">
						{currentQuestion.question_text}
					</div>
					<div className="space-y-3">
						{options.map(({ key, value }) => (
							<Button
								key={key}
								variant="outline"
								className="w-full h-auto min-h-[3rem] py-2 px-4 whitespace-normal text-left"
								onClick={() =>
									handleAnswer(key)
								}
							>
								<span className="w-full break-words">
									{value}
								</span>
							</Button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};