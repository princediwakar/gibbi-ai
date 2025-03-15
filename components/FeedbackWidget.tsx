"use client";

import { Button } from "@/components/ui/button";
import {
	MessageCircle,
	Send,
	X,
	Bug,
	Lightbulb,
	MessageSquare,
	Star,
} from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

export function FeedbackWidget() {
	const [isOpen, setIsOpen] = useState(false);
	const [feedback, setFeedback] = useState("");
	const [category, setCategory] = useState("");
	const [rating, setRating] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const user = useUser();

	const handleSubmit = async () => {
		if (!feedback.trim() || !category) {
			toast.error("Please fill all fields");
			return;
		}

		setIsSubmitting(true);
		try {
			const { error } = await supabase
				.from("feedback")
				.insert([
					{
						message: feedback,
						type: category,
						rating:
							category === "feedback"
								? rating
								: null,
						user_id: user?.id || null,
						user_email:
							user?.email || "anonymous",
						user_name:
							user?.user_metadata?.name ||
							"Anonymous",
					},
				]);

			if (error) throw error;

			toast.success("Thank you for your feedback!");
			setIsOpen(false);
			setFeedback("");
			setCategory("");
			setRating(0);
		} catch (error) {
			console.error(
				"Error submitting feedback:",
				error
			);
			toast.error(
				"Failed to submit feedback. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed bottom-4 right-4 z-50">
			{isOpen ? (
				<div className="bg-card p-4 rounded-lg shadow-lg w-80 space-y-3 border">
					<div className="flex justify-between items-center">
						<h3 className="font-semibold">
							Share Feedback
						</h3>
						<button
							onClick={() => setIsOpen(false)}
							className="p-1 rounded-full hover:bg-muted"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					<Select
						onValueChange={setCategory}
						value={category}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="feedback">
								<div className="flex items-center gap-2">
									<MessageSquare className="w-4 h-4" />
									General Feedback
								</div>
							</SelectItem>
							<SelectItem value="feature">
								<div className="flex items-center gap-2">
									<Lightbulb className="w-4 h-4" />
									Feature Request
								</div>
							</SelectItem>
							<SelectItem value="bug">
								<div className="flex items-center gap-2">
									<Bug className="w-4 h-4" />
									Bug Report
								</div>
							</SelectItem>
						</SelectContent>
					</Select>

					{category === "feedback" && (
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">
								How would you rate your
								experience?
							</p>
							<div className="flex gap-1">
								{[1, 2, 3, 4, 5].map(
									(star) => (
										<button
											key={star}
											onClick={() =>
												setRating(
													star
												)
											}
											className={`p-1 ${
												star <=
												rating
													? "text-yellow-400"
													: "text-muted-foreground"
											}`}
										>
											<Star className="w-5 h-5 fill-current" />
										</button>
									)
								)}
							</div>
						</div>
					)}

					<Textarea
						value={feedback}
						onChange={(e) =>
							setFeedback(e.target.value)
						}
						placeholder={
							category === "feature"
								? "Describe your feature request..."
								: category === "bug"
								? "Describe the bug you encountered..."
								: "Share your feedback..."
						}
						className="min-h-[100px]"
					/>

					<Button
						onClick={handleSubmit}
						disabled={isSubmitting}
						className="w-full gap-2"
					>
						<Send className="w-4 h-4" />
						{isSubmitting
							? "Submitting..."
							: "Submit"}
					</Button>
				</div>
			) : (
				<Button
					onClick={() => setIsOpen(true)}
					className="rounded-full w-12 h-12 p-0 shadow-lg"
				>
					<MessageCircle className="w-5 h-5" />
				</Button>
			)}
		</div>
	);
}



