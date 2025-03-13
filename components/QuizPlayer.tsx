"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types/quiz";
import { QuizResults } from "./QuizResults";
import Link from "next/link";
import { QuizDetails } from "./QuizDetails";
import { GoBackOrHome } from "./GoBackOrHome";
import Katex from "@matejmazur/react-katex";

interface QuizPlayerProps {
	quiz: Quiz;
	embedMode?: boolean;
}

interface Option {
	key: string;
	value: string;
}



const renderMathContent = (
	text: string
): React.ReactNode[] => {
	const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);

	return parts.map((part, index) => {
		if (part.startsWith("$$") && part.endsWith("$$")) {
			return (
				<Katex
					key={index}
					math={part.slice(2, -2)}
					block // This makes it a block math element
				/>
			);
		} else if (
			part.startsWith("$") &&
			part.endsWith("$")
		) {
			return (
				<Katex
					key={index}
					math={part.slice(1, -1)}
				/>
			);
		}
		return <span key={index}>{part}</span>;
	});
};

export const QuizPlayer = ({
	quiz,
	embedMode = false,
}: QuizPlayerProps) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [completed, setCompleted] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [userAnswers, setUserAnswers] = useState<{
		[key: number]: string;
	}>({});

	if (!quiz) {
		return (
			<div className="text-center">
				<p>Quiz not found</p>
				<Link href="/">
					<Button
						className="w-full"
						variant="outline"
					>
						Back to Home
					</Button>
				</Link>
			</div>
		);
	}

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

	const parseOptions = (
		options: string | Record<string, string>
	): Option[] => {
		try {
			const parsed =
				typeof options === "string"
					? JSON.parse(options)
					: options;
			return Object.entries(parsed).map(
				([key, value]) => ({
					key,
					value: String(value), // Ensure value is always a string
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

	if (!quiz.questions || quiz.questions.length === 0) {
		return (
			<div className="text-center">
				<p>No questions available for this quiz.</p>
				<GoBackOrHome />
			</div>
		);
	}

	const currentQuestion = quiz.questions[currentIndex];
	const options = parseOptions(currentQuestion.options);

	return (
		<div
			className={`${
				embedMode ? "w-full p-4" : "max-w-xl mt-10"
			} mx-auto`}
		>
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
					// onShare={handleShareResults}
				/>
			) : (
				<div className="space-y-6">
					<div className="text-lg font-medium">
						{renderMathContent(
							currentQuestion.question_text
						)}
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
									{renderMathContent(
										value
									)}
								</span>
							</Button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};











