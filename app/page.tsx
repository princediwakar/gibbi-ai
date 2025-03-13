import { QuizDashboard } from "@/components/QuizDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "QuizMasterAI - Test Your Knowledge",
	description:
		"Create, share, and take quizzes on any topic. Join QuizMasterAI to challenge yourself and others!",
	keywords: [
		"quiz",
		"trivia",
		"knowledge test",
		"education",
		"learning",
	],
	openGraph: {
		title: "QuizMasterAI - Test Your Knowledge",
		description:
			"Create, share, and take quizzes on any topic. Join QuizMaster to challenge yourself and others!",
		url: process.env.NEXT_PUBLIC_BASE_URL,
		siteName: "QuizmasterAI",
		images: [
			{
				url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=home`,
				width: 1200,
				height: 630,
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "QuizmasterAI - Test Your Knowledge",
		description:
			"Create, share, and take quizzes on any topic. Join QuizmasterAI to challenge yourself and others!",
		images: [
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=home`,
		],
	},
};

export default function Home() {
	return (
		<div>
			<QuizDashboard />
		</div>
	);
}
