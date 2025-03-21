import { Metadata } from "next";

const baseUrl =
	process.env.NEXT_PUBLIC_BASE_URL
    
const ogImageUrl = `${baseUrl}/api/og?type=home`;

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
		url: `${baseUrl}/quizzes`,
		siteName: "QuizMasterAI",
		images: [
			{
				url: ogImageUrl,
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
		images: [ogImageUrl],
	},
};
