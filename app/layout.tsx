import { ThemeProvider } from "@/components/theme-provider"
// import { ClarityProvider } from '@/components/ClarityProvider';

import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner"
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
	title: {
		default: "Gibbi AI",
		template: "%s - Gibbi AI", // Appends app name to page titles
	},
	description: "Create and explore AI-powered quizzes.",
	icons: {
		icon: "/icon.ico"
	},
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
					{/* Main Content */}
					<div className="max-w-5xl mx-auto pt-16">
						{children}
						<FeedbackWidget />
						<Toaster
							position="top-center"
							richColors
						/>
					</div>
				</ThemeProvider>

			</body>
		</html>
	);
}
