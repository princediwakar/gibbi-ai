import { FeedbackList } from "@/components/FeedbackList";

export default function FeedbackPage() {
	return (
		<div className="container mx-auto p-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">
					User Feedback
				</h1>
				<FeedbackList />
			</div>
		</div>
	);
}
