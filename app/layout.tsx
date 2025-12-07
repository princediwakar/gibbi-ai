import { ThemeProvider } from "@/components/theme-provider"
// import { ClarityProvider } from '@/components/ClarityProvider';

import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner"
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { Metadata, Viewport } from "next";
import StructuredData, { websiteSchema, organizationSchema } from "@/components/seo/structured-data";
import "./globals.css";
import "katex/dist/katex.min.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gibbi.vercel.app";

export const metadata: Metadata = {
	title: {
		default: "GibbiAI - Test Your Knowledge",
		template: "%s - Gibbi AI", // Appends app name to page titles
	},
	description: "Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
	keywords: [
		"quiz",
		"trivia",
		"knowledge test",
		"education",
		"learning",
	],
	openGraph: {
		title: "GibbiAI - Test Your Knowledge",
		description: "Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
		url: baseUrl,
		siteName: "GibbiAI",
		images: [
			{
				url: `${baseUrl}/api/og?type=home`,
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
		description: "Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
		images: [
			`${baseUrl}/api/og?type=home`,
		],
	},
	icons: {
		icon: "/icon.ico"
	},
	metadataBase: new URL(baseUrl),
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};



export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{/* <ClarityProvider /> */}
					{/* Include Header */}
					<Header />
					{/* Structured Data for SEO */}
					<StructuredData schema={websiteSchema} />
					<StructuredData schema={organizationSchema} />
					{/* Main Content */}
					<div className="max-w-5xl mx-auto pt-16">
						{children}
						<FeedbackWidget />
						<Toaster
							position="top-center"
							richColors
						/>
					</div>
					{/* Footer */}
					<Footer />
				</ThemeProvider>

			</body>
		</html>
	);
}
