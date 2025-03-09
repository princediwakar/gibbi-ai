import { QuizPlayer } from "@/app/quiz/QuizPlayer";
import { notFound } from "next/navigation";
import { getQuizData } from "@/lib/getQuizData";
import { Metadata } from "next";

interface PageProps {
	params: Promise<{ quizId: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { quizId } = await params;
	const data = await getQuizData(quizId);

	if (!data) notFound();

	return {
		title: `${data.quiz.title} - QuizMaster`,
		description: `Take the ${data.quiz.title} quiz on ${
			data.quiz.topic
		}. Created by ${data.creatorName}. ${
			data.quiz.description || ""
		}`,
		keywords: [
			data.quiz.title,
			data.quiz.topic,
			data.quiz.subject,
			data.quiz.difficulty,
			"quiz",
			"test",
			"knowledge",
		],
		openGraph: {
			title: `${data.quiz.title} - QuizMaster`,
			description: `Take the ${data.quiz.title} quiz on ${data.quiz.topic}. Created by ${data.creatorName}.`,
			images: [
				{
					url: `/api/og?title=${encodeURIComponent(
						data.quiz.title
					)}&topic=${encodeURIComponent(
						data.quiz.topic
					)}`,
					width: 1200,
					height: 630,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${data.quiz.title} - QuizMaster`,
			description: `Take the ${data.quiz.title} quiz on ${data.quiz.topic}. Created by ${data.creatorName}.`,
		},
	};
}

export default async function QuizPage({
	params,
}: PageProps) {
	const { quizId } = await params;
	const data = await getQuizData(quizId);

	if (!data) {
		notFound();
	}

	const quizWithQuestions = {
		...data.quiz,
		creatorName: data.creatorName,
		questions: data.questions,
	};

	return (
		<div className="max-w-4xl mx-auto p-4 space-y-6">
		
			<QuizPlayer quiz={quizWithQuestions} />
		</div>
	);
}
