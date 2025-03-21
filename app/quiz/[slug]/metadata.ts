import { Metadata } from "next";
import { getQuizMetadata } from "@/lib/queries";
import { extractIdFromSlug } from "@/lib/utils";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

	if (!baseUrl) {
		console.error(
			"NEXT_PUBLIC_BASE_URL is not defined"
		);
		return {
			title: "Quiz - QuizMasterAI",
			description:
				"Take quizzes and test your knowledge",
		};
	}

	try {
		const quizId = extractIdFromSlug(slug);
		if (!quizId) {
			return {
				title: "Quiz Not Found",
				description: "Invalid quiz URL",
			};
		}

		const quiz = await getQuizMetadata(quizId);
		if (!quiz) {
			return {
				title: "Quiz Not Found",
				description:
					"The requested quiz could not be found",
			};
		}

		const ogImageUrl = `${baseUrl}/api/og?type=quiz&title=${encodeURIComponent(
			quiz.title
		)}&topic=${encodeURIComponent(quiz.topic)}`;

		return {
			title: `${quiz.title} - QuizMasterAI`,
			description: `Take the ${quiz.title} quiz on ${
				quiz.topic
			}. Created by ${quiz.creator_name}. ${
				quiz.description || ""
			}`,
			keywords: [
				quiz.title,
				quiz.topic,
				quiz.subject,
				quiz.difficulty,
				"quiz",
				"test",
				"knowledge",
			].filter(Boolean) as string[],
			openGraph: {
				type: "website",
				url: `${baseUrl}/quiz/${slug}`,
				title: `${quiz.title} - QuizMasterAI`,
				description: `Take the ${quiz.title} quiz on ${quiz.topic}. Created by ${quiz.creator_name}.`,
				images: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
					},
				],
			},
			twitter: {
				card: "summary_large_image",
				title: `${quiz.title} - QuizMasterAI`,
				description: `Take the ${quiz.title} quiz on ${quiz.topic}. Created by ${quiz.creator_name}.`,
				images: [ogImageUrl],
			},
		};
	} catch (error) {
		console.error("Error generating metadata:", error);
		return {
			title: "Quiz - QuizMasterAI",
			description:
				"Take quizzes and test your knowledge",
		};
	}
}
