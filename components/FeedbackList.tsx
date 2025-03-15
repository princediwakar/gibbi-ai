"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Lightbulb,
	Bug,
	MessageSquare,
	Star,
} from "lucide-react";

interface Feedback {
	id: string;
	message: string;
	type: "feedback" | "feature" | "bug";
	rating?: number;
	created_at: string;
	user_email: string;
	user_name: string;
}

export function FeedbackList() {
	const [feedback, setFeedback] = useState<Feedback[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchFeedback = async () => {
			try {
				const { data, error } = await supabase
					.from("feedback")
					.select("*")
					.order("created_at", {
						ascending: false,
					});

				if (error) throw error;
				setFeedback(data || []);
			} catch (error) {
				console.error(
					"Error fetching feedback:",
					error
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchFeedback();
	}, []);

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(5)].map((_, i) => (
					<Skeleton
						key={i}
						className="h-24 w-full"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{feedback.length === 0 ? (
				<div className="text-center text-muted-foreground py-8">
					No feedback submitted yet.
				</div>
			) : (
				feedback.map((item) => (
					<div
						key={item.id}
						className="bg-card p-4 rounded-lg border"
					>
						<div className="flex justify-between items-start">
							<div>
								<Badge
									variant={
										item.type ===
										"feature"
											? "default"
											: item.type ===
											  "bug"
											? "destructive"
											: "secondary"
									}
								>
									{item.type ===
										"feature" && (
										<Lightbulb className="w-3 h-3 mr-1" />
									)}
									{item.type ===
										"bug" && (
										<Bug className="w-3 h-3 mr-1" />
									)}
									{item.type ===
										"feedback" && (
										<MessageSquare className="w-3 h-3 mr-1" />
									)}
									{item.type}
								</Badge>
								{item.rating && (
									<div className="flex items-center gap-1 mt-2">
										{[...Array(5)].map(
											(_, i) => (
												<Star
													key={i}
													className={`w-4 h-4 ${
														i <
														item.rating
															? "text-yellow-400 fill-current"
															: "text-muted-foreground"
													}`}
												/>
											)
										)}
									</div>
								)}
							</div>
							<p className="text-sm text-muted-foreground">
								{format(
									new Date(
										item.created_at
									),
									"MMM d, yyyy - h:mm a"
								)}
							</p>
						</div>
						<p className="mt-3 text-sm">
							{item.message}
						</p>
						<div className="mt-2 text-sm text-muted-foreground">
							Submitted by:{" "}
							{item.user_name ||
								item.user_email ||
								"Anonymous"}
						</div>
					</div>
				))
			)}
		</div>
	);
}
