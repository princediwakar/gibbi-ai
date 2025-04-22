import { ThemeProvider } from "@/components/theme-provider"

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
			<head>
				{/* Microsoft Clarity Analytics */}
				 <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;
                t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID || 'r812jm9i2g'}");
            `,
          }}
        />
			</head>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
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
