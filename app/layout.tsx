import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { FeedbackWidget } from "@/components/FeedbackWidget";

export const metadata: Metadata = {
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
			<body>
				{/* Include Header */}
				<Header />
				{/* Main Content */}
				<div className="max-w-5xl mx-auto p-6">
					{children}
					<FeedbackWidget />
					<Toaster
						position="top-center"
						richColors
					/>
				</div>
			</body>
		</html>
	);
}
