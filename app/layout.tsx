import { Toaster } from "@/components/ui/toast";
import Header from "@/components/Header";
import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	// metadataBase: new URL(
	// 	"https://localhost:3000"
	// ),

	// title: "Quiz App",
	// description:
	// 	"Interactive quizzes you can embed anywhere",
	// openGraph: {
	// 	title: "Quiz App",
	// 	description: "Take this interactive quiz!",
	// 	images: [
	// 		{
	// 			url: "/og-image.png", // Now relative to metadataBase
	// 			width: 1200,
	// 			height: 630,
	// 		},
	// 	],
	// },
	// twitter: {
	// 	card: "summary_large_image",
	// 	title: "Quiz App",
	// 	description: "Take this interactive quiz!",
	// 	images: [
	// 		"/og-image.png", // Now relative to metadataBase
	// 	],
	// },

	icons: {
		icon: "/favicon.ico",
	},
};
export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<link
					rel="alternate"
					type="application/json+oembed"
					href="https://quizmasterai.vercel.app/api/oembed?url={quiz_url}"
				/>
			</head>
			<body>
				{/* Include Header */}
				<Header />
				{/* Main Content */}
				<main className="max-w-7xl mx-auto p-6">
					{children}
					<Toaster
						position="top-center"
						richColors
					/>
				</main>
			</body>
		</html>
	);
}
