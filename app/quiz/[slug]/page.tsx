// File: app/quiz/[quizId]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { QuizPlayer } from "@/components/QuizPlayer";
import { getQuizWithQuestions } from "@/lib/queries";
import { getQuizMetadata } from "@/lib/queries";
import { extractIdFromSlug } from "@/lib/utils";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	// Make sure the slug exists
	if (!slug) {
		throw new Error("Slug is required");
	}
	const quizId = extractIdFromSlug(slug);
	if (!quizId) {
		throw new Error("quizId is required");
	}
	const quiz = await getQuizMetadata(quizId);

	if (!quiz) {
		return {
			title: "Quiz Not Found",
			description:
				"The requested quiz could not be found",
		};
	}

	return {
		title: `${quiz.title} - QuizMasterAI`,
		description: `Take the ${quiz.title} quiz on ${
			quiz.topic
		}. Created by ${quiz.creator_name}. ${
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
			url: `${process.env.NEXT_PUBLIC_BASE_URL}/quiz/${slug}`,
			title: `${quiz.title} - QuizMasterAI`,
			description: `Take the ${quiz.title} quiz on ${quiz.topic}. Created by ${quiz.creator_name}.`,
			images: [
				{
					url: `${
						process.env.NEXT_PUBLIC_BASE_URL
					}/api/og?type=quiz&title=${encodeURIComponent(
						quiz.title ?? ""
					)}&topic=${encodeURIComponent(
						quiz.topic ?? ""
					)}`,
					width: 1200,
					height: 630,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${quiz.title} - QuizMasterAI`,
			description: `Take the ${quiz.title} quiz on ${quiz.topic}. Created by ${quiz.creator_name}.`,
			images: [
				`${
					process.env.NEXT_PUBLIC_BASE_URL
				}/api/og?type=quiz&title=${encodeURIComponent(
					quiz.title ?? ""
				)}&topic=${encodeURIComponent(
					quiz.topic ?? ""
				)}`,
			],
		},
	};
}

export default async function QuizPage({
	params,
}: PageProps) {
	const { slug } = await params;
	// Make sure the slug exists
	if (!slug) {
		throw new Error("Slug is required");
	}
	const quizId = extractIdFromSlug(slug);
	if (!quizId) {
		throw new Error("quizId is required");
	}

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
