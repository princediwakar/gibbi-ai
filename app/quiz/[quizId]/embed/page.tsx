import { QuizPlayer } from "@/app/quiz/QuizPlayer";
import { notFound } from "next/navigation";
import { getQuizWithQuestions } from "@/lib/getQuizWithQuestions";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Embedded Quiz",
		robots: {
			index: false,
			follow: false,
			nocache: true,
			googleBot: {
				index: false,
				follow: false,
				noimageindex: true,
			},
		},
	};
}

export default async function EmbedPage({
	params,
}: {
	params: Promise<{ quizId: string }>;
}) {
	const {quizId} = await params
	const quiz = await getQuizWithQuestions(quizId);

	if (!quiz) {
		return notFound();
	}

	return (
		<div className="min-h-[600px] w-full bg-white">
			<QuizPlayer quiz={quiz} embedMode />
		</div>
	);
}
