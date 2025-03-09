import { Toaster } from "@/components/ui/toast";
import Header from "@/components/Header";
import "./globals.css";
import { Metadata } from "next";

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
