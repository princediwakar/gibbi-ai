// app/page.tsx

import { QuizCard } from "@/components/quiz-card";
import { getPublicQuizzes } from "@/lib/queries";
import { metadata } from "./metadata";

export { metadata };


export default async function QuizzesPage() {
	const quizzes = await getPublicQuizzes();

	if (quizzes.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">
					Public Quizzes
				</h1>
				<div className="text-center text-gray-500">
					No public quizzes available. Why not
					create one?
				</div>
			</div>
		);
	}

	// Filter out failed quizzes but include ready and those without status
	const validQuizzes = quizzes.filter(
		(quiz) =>
			quiz.status !== "failed" &&
			quiz.status !== "pending"
	);

	// Group quizzes by subject
	const quizzesBySubject = validQuizzes.reduce(
		(acc, quiz) => {
			const subject = quiz.subject || "General";
			if (!acc[subject]) {
				acc[subject] = [];
			}
			acc[subject].push(quiz);
			return acc;
		},
		{} as Record<string, typeof validQuizzes>
	);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">
				Public Quizzes
			</h1>

			{Object.keys(quizzesBySubject).length === 0 ? (
				<div className="text-center text-gray-500">
					No public quizzes available
				</div>
			) : (
				<div className="space-y-8">
					{Object.entries(quizzesBySubject).map(
						([subject, quizzes]) => (
							<div
								key={subject}
								className="space-y-4"
							>
								<h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
									{subject}
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{quizzes.map((quiz) => (
										<QuizCard
											key={
												quiz.quiz_id
											}
											quiz={quiz}
										/>
									))}
								</div>
							</div>
						)
					)}
				</div>
			)}
		</div>
	);
}
