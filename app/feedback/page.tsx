import { FeedbackList } from "@/components/feedback/FeedbackList";

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
