import { QuizCard } from "@/components/quiz-card";
import { getPublicQuizzes } from "@/lib/queries";

import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Public Quizzes - QuizMasterAI",
	description:
		"Explore and take public quizzes on various topics. Test your knowledge and learn new things!",
	keywords: [
		"quizzes",
		"public quizzes",
		"knowledge test",
		"learning",
		"education",
	],
	openGraph: {
		title: "Public Quizzes - QuizMasterAI",
		description:
			"Explore and take public quizzes on various topics",
		url: "/quizzes",
		siteName: "QuizMaster",
		images: [
			{
				url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=home`,
				width: 1200,
				height: 630,
				alt: "QuizMasterAI Public Quizzes",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Public Quizzes - QuizMasterAI",
		description:
			"Explore and take public quizzes on various topics",
		images: [
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=home`,
		], // Add your Twitter image path here
	},
};





export default async function QuizzesPage() {
	const quizzes = await getPublicQuizzes();

	// Group quizzes by subject
	const quizzesBySubject = quizzes.reduce((acc, quiz) => {
		const subject = quiz.subject || "General";
		if (!acc[subject]) {
			acc[subject] = [];
		}
		acc[subject].push(quiz);
		return acc;
	}, {} as Record<string, typeof quizzes>);

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
							<div key={subject} className="space-y-4">
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
