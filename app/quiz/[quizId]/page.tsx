// File: app/quiz/[quizId]/page.tsx

import { QuizPlayer } from "@/app/quiz/QuizPlayer";
import { notFound } from "next/navigation";
import { getQuizWithQuestions } from "@/lib/getQuizWithQuestions";
import { Metadata } from "next";
import { getQuizMetadata } from "@/lib/getQuizMetadata";

interface PageProps {
	params: Promise<{ quizId: string }>;
}


export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { quizId } = await params;
	const quiz = await getQuizMetadata(quizId);

	if (!quiz) {
		return {
			title: "Quiz Not Found",
			description:
				"The requested quiz could not be found",
		};
	}

	const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/screenshot?quizId=${quizId}`;

	return {
		title: `${quiz.title} - QuizMaster`,
		description: `Take the ${quiz.title} quiz on ${
			quiz.topic
		}. Created by ${quiz.creatorName}. ${
			quiz.description || ""
		}`,
		openGraph: {
			type: "website",
			url: `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${quizId}`,
			title: `${quiz.title} - QuizMaster`,
			description: `Take the ${quiz.title} quiz on ${quiz.topic}. Created by ${quiz.creatorName}.`,
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: `${quiz.title} quiz preview`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${quiz.title} - QuizMaster`,
			description: `Take the ${quiz.title} quiz on ${quiz.topic}. Created by ${quiz.creatorName}.`,
			images: [imageUrl],
		},
	};
}

export default async function QuizPage({
	params,
}: PageProps) {
	const { quizId } = await params;
	const quiz = await getQuizWithQuestions(quizId);

	if (!quiz) {
		notFound();
	}


	return (
		<div className="max-w-4xl mx-auto p-4 space-y-6">
			<QuizPlayer quiz={quiz} />
		</div>
	);
}
