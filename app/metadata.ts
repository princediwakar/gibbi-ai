import { Metadata } from "next";

export const metadata: Metadata = {
	title: "GibbiAI - Practice Tests That Find What You Don't Know",
	description:
		"Paste your notes or upload a PDF. Get practice tests in seconds. No card-making, no setup—just study what you don't know.",
	keywords: [
		"test prep",
		"exam prep",
		"practice test",
		"AI study app",
		"flashcard alternative",
		"education",
		"learning",
	],
	openGraph: {
		title: "GibbiAI - Practice Tests That Find What You Don't Know",
		description:
			"Paste your notes or upload a PDF. Get practice tests in seconds. No card-making, no setup—just study what you don't know.",
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
		title: "GibbiAI - AI-Powered Test Prep",
		description:
			"Turn any study material into practice tests. AI-powered test prep that helps you master any subject and ace your exams.",
		images: [
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=home`,
		],
	},
};
