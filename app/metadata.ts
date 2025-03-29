import { Metadata } from "next";

export const metadata: Metadata = {
	title: "GibbiAI - Test Your Knowledge",
	description:
		"Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
	keywords: [
		"quiz",
		"trivia",
		"knowledge test",
		"education",
		"learning",
	],
	openGraph: {
		title: "GibbiAI - Test Your Knowledge",
		description:
			"Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
		url: process.env.NEXT_PUBLIC_BASE_URL,
		siteName: "GibbiAI",
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
		title: "GibbiAI - Test Your Knowledge",
		description:
			"Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
		images: [
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=home`,
		],
	},
};
