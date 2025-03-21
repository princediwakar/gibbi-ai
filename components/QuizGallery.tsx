"use client";

import { useMemo, useState } from "react";
import { Quiz } from "@/types/quiz";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { QuizCard } from "./quiz-card";

interface QuizGalleryProps {
	savedQuizzes: Quiz[] | null;
	isLoading: boolean;
	onQuizDeleted?: (quizId: string) => void;
	onQuizUpdated?: (updatedQuiz: Quiz) => void;
}

export const QuizGallery = ({
	savedQuizzes,
	isLoading,
	onQuizDeleted,
	onQuizUpdated,
}: QuizGalleryProps) => {
	const [searchQuery, setSearchQuery] = useState("");

	// Memoized filtered quizzes
	const filteredQuizzes = useMemo(() => {
		if (!savedQuizzes) return null;

		// Filter out failed quizzes
		const validQuizzes = savedQuizzes.filter(
			(quiz) => quiz.status === "ready" 
		);

		const searchLower = searchQuery.toLowerCase();
		return validQuizzes.filter((quiz) => {
			return (
				quiz.subject
					?.toLowerCase()
					.includes(searchLower) ||
				quiz.topic
					?.toLowerCase()
					.includes(searchLower) ||
				quiz.description
					?.toLowerCase()
					.includes(searchLower) ||
				quiz.title
					?.toLowerCase()
					.includes(searchLower)
			);
		});
	}, [savedQuizzes, searchQuery]);

	// Memoized grouped quizzes
	const quizzesBySubject = useMemo(() => {
		if (!filteredQuizzes) return null;
		return filteredQuizzes.reduce((acc, quiz) => {
			const subject = quiz.subject || "General";
			if (!acc[subject]) acc[subject] = [];
			acc[subject].push(quiz);
			return acc;
		}, {} as Record<string, Quiz[]>);
	}, [filteredQuizzes]);

	// Add this check after hooks
	if (!savedQuizzes && !isLoading) {
		return (
			<div className="text-center text-muted-foreground py-6">
				Please log in to view your quizzes.
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="text-center">
				<Loader2 className="w-6 h-6 animate-spin mx-auto" />
				<p className="text-sm text-muted-foreground mt-2">
					Loading quizzes...
				</p>
			</div>
		);
	}

	// Empty state
	if (!savedQuizzes || savedQuizzes.length === 0) {
		return (
			<div className="text-center text-muted-foreground py-6">
				No quizzes available. Create one to get
				started!
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-2xl mx-auto">
			<h2 className="text-xl font-bold text-gray-800 mb-4">
				My Library
			</h2>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search quizzes..."
					className="pl-10"
					value={searchQuery}
					onChange={(e) =>
						setSearchQuery(e.target.value)
					}
				/>
			</div>

			{quizzesBySubject &&
			Object.keys(quizzesBySubject).length ? (
				Object.entries(quizzesBySubject).map(
					([subject, quizzes]) => {
						return (
							<div
								key={subject}
								className="space-y-4"
							>
								<h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
									{subject}
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									{quizzes.map((quiz) => (
										<QuizCard
											key={
												quiz.quiz_id
											}
											quiz={quiz}
											onDelete={
												onQuizDeleted
											}
											onUpdate={
												onQuizUpdated
											}
										/>
									))}
								</div>
							</div>
						);
					}
				)
			) : (
				<p className="text-center text-muted-foreground py-6">
					{searchQuery
						? "No matching quizzes found"
						: "No quizzes available"}
				</p>
			)}
		</div>
	);
};
