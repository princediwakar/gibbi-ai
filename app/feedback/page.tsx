import { FeedbackList } from "@/components/feedback/FeedbackList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Feedback",
  description: "Read feedback from users about GibbiAI quiz platform. See what others think about our AI-powered quiz creation tool.",
  openGraph: {
    title: "User Feedback - GibbiAI",
    description: "See what users are saying about GibbiAI's quiz creation platform.",
  },
  twitter: {
    title: "User Feedback - GibbiAI",
    description: "See what users are saying about GibbiAI's quiz creation platform.",
  },
};

export default function FeedbackPage() {
	return (
		<div className="container mx-auto p-4">
			<div className="mx-auto">
				<h1 className="text-3xl font-bold mb-6">
					User Feedback
				</h1>
				<FeedbackList />
			</div>
		</div>
	);
}
