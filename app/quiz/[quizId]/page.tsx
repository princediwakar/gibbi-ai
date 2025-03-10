// File: app/quiz/[quizId]/page.tsx

import { QuizPlayer } from "@/app/quiz/QuizPlayer";
import { notFound } from "next/navigation";
import { getQuizWithQuestions } from "@/lib/getQuizWithQuestions";
import { Metadata } from "next";
import { getQuizMetadata } from "@/lib/getQuizMetadata";
import Head from "next/head";

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

	// Point to the embed page for the iframe
	const embedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/embed/${quizId}`;

	return {
		title: `${quiz.title} - QuizMaster`,
		description: `Take the ${quiz.title} quiz on ${
			quiz.topic
		}. Created by ${quiz.creatorName}. ${
			quiz.description || ""
		}`,
		keywords: [
			quiz.title ?? "",
			quiz.topic ?? "",
			quiz.subject ?? "",
			quiz.difficulty ?? "",
			"quiz",
			"test",
			"knowledge",
		],
		openGraph: {
			type: "website",
			url: embedUrl, // Embed URL
			title: `${quiz.title} - QuizMaster`,
			description: `Take the ${quiz.title} quiz on ${quiz.topic}. Created by ${quiz.creatorName}.`,
		},
		twitter: {
			card: "summary_large_image",
			title: `${quiz.title} - QuizMaster`,
			description: `Take the ${quiz.title} quiz on ${quiz.topic}. Created by ${quiz.creatorName}.`,
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

	  const embedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/embed/${quizId}`;


	return (
		<div className="max-w-4xl mx-auto p-4 space-y-6">
			<Head>
				{/* Add the oembed metadata link */}
				<link
					rel="alternate"
					type="application/json+oembed"
					href={`${
						process.env.NEXT_PUBLIC_BASE_URL
					}/api/oembed?url=${encodeURIComponent(
						embedUrl
					)}`}
				/>
			</Head>
			<QuizPlayer quiz={quiz} />
		</div>
	);
}
