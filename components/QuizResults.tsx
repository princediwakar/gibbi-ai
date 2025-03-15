"use client";

import { Quiz } from "@/types/quiz";
import { Check, X } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { ShareableResultsCard } from "./ShareableResultsCard";
import { GoBackOrHome } from "./GoBackOrHome";
import Katex from "@matejmazur/react-katex";

interface QuizResultsProps {
	quiz: Quiz;
	userAnswers: { [key: number]: string };
	score: number;
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
export const QuizResults = ({
	quiz,
	userAnswers,
	score,
}: QuizResultsProps) => {
	const percentage = (
		(score / quiz.question_count) *
		100
	).toFixed(1);

	if (!quiz.questions) {
		return (
			<div className="text-center text-gray-500 py-6">
				No questions available for review.
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-2xl mx-auto">
			{/* Shareable Results Section */}
			<div className="bg-gradient-to-br from-indigo-600 to-pink-500 rounded-xl p-6 text-white">
				<ShareableResultsCard
					quiz={quiz}
					score={score}
					percentage={percentage}
				/>
			</div>

			{/* Performance Breakdown */}
			<div className="space-y-4">
				<h3 className="text-xl font-bold text-gray-800">
					Performance Breakdown
				</h3>
				<div className="grid grid-cols-2 gap-4">
					<div className="bg-green-50 p-4 rounded-lg">
						<div className="text-green-600 font-bold text-2xl">
							{score}
						</div>
						<div className="text-sm text-green-600">
							Correct Answers
						</div>
					</div>
					<div className="bg-red-50 p-4 rounded-lg">
						<div className="text-red-600 font-bold text-2xl">
							{quiz.question_count - score}
						</div>
						<div className="text-sm text-red-600">
							Incorrect Answers
						</div>
					</div>
				</div>
			</div>

			{/* Question Review */}
			<div className="space-y-4">
				<h3 className="text-xl font-bold text-gray-800">
					Question Review
				</h3>
				<Accordion
					type="single"
					collapsible
					className="w-full"
				>
					{quiz.questions.map(
						(question, index) => {
							const isCorrect =
								userAnswers[index] ===
								question.correct_option;
							const userAnswer =
								userAnswers[index];
							const correctAnswer =
								question.correct_option;
							const optionsMap =
								typeof question.options ===
								"string"
									? JSON.parse(
											question.options
									  )
									: question.options;
							return (
								<AccordionItem
									key={index}
									value={`item-${index}`}
								>
									<AccordionTrigger className="hover:no-underline w-full px-4 py-3 rounded-lg hover:bg-gray-50">
										<div className="flex items-start space-x-3 w-full">
											{isCorrect ? (
												<Check className="w-5 h-5 text-green-500 shrink-0 mt-1" />
											) : (
												<X className="w-5 h-5 text-red-500 shrink-0 mt-1" />
											)}
											<div className="text-left flex-1 min-w-0">
												<span className="font-medium text-gray-800">
													Q
													{index +
														1}
													:{" "}
												</span>
												<span className="whitespace-normal break-words text-gray-700">
													{renderMathContent(
														question.question_text
													)}
												</span>
											</div>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-4">
										<div className="space-y-3 p-4 bg-gray-50 rounded-lg">
											<div className="text-sm text-gray-700">
												Your answer:{" "}
												{renderMathContent(
													optionsMap[
														userAnswer
													]
												) ||
													"No answer"}
											</div>
											{!isCorrect && (
												<div className="text-sm text-gray-700">
													Correct
													answer:{" "}
													{renderMathContent(
														optionsMap[
															correctAnswer
														]
													)}
												</div>
											)}
										</div>
									</AccordionContent>
								</AccordionItem>
							);
						}
					)}
				</Accordion>
			</div>

			{/* Navigation */}
			<div className="flex gap-4">
				<GoBackOrHome />
			</div>
		</div>
	);
};
