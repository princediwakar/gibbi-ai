import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import "./globals.css";
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
