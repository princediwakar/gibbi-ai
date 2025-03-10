import { QuizPlayer } from "@/app/quiz/QuizPlayer";
import { notFound } from "next/navigation";
import { getQuizWithQuestions } from "@/lib/getQuizWithQuestions";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Quiz",
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
		openGraph: {
			type: "website",
			url: "/",
			title: "Quiz",
			description: "Interactive quiz",
			images: [], // Empty array prevents OG image generation
		},
		twitter: {
			card: "summary",
			title: "Quiz",
			description: "Interactive quiz",
			images: [], // Empty array prevents Twitter card image
		},
		other: {
			"twitter:image:src": "", // Explicitly empty
			"og:image": "", // Explicitly empty
			"og:image:width": "",
			"og:image:height": "",
			"og:image:alt": "",
		},
	};
}

export default async function EmbedPage({
	params,
}: {
	params: { quizId: string };
}) {
	const { quizId } = params;
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
