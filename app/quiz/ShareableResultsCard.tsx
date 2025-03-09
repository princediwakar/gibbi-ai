"use client";

import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { useUser } from "@/hooks/use-user";

interface ShareableResultsCardProps {
	quiz: Quiz;
	score: number;
	percentage: string;
}

export const ShareableResultsCard = ({
	quiz,
	score,
	percentage,
}: ShareableResultsCardProps) => {
	const [, copy] = useCopyToClipboard();
	const user = useUser();

	// Update the handleShare function
	const handleShare = async () => {
		try {
			const shareText = `I scored ${score}/${quiz.num_questions} (${percentage}%) on "${quiz.title}" quiz! 🎉\n\nTry it yourself: ${window.location.href}`;

			// Check if native sharing is supported
			if (navigator.share) {
				try {
					await navigator.share({
						title: `My Quiz Results: ${quiz.title}`,
						text: shareText,
						url: window.location.href,
					});
					toast.success(
						"Results shared successfully!"
					);
					return;
					// Update the error handling
				} catch (shareError: unknown) {
					// Handle share cancellation
					if (
						shareError instanceof Error &&
						shareError.name === "AbortError"
					) {
						return; // User cancelled, do nothing
					}
					console.log(
						"Native share failed, falling back to clipboard"
					);
					console.error(
						"Sharing Error:",
						shareError
					);
				}
			}

			// Fallback to clipboard
			await copy(shareText);
			toast.success("Results copied to clipboard!");
		} catch (error) {
			toast.error("Failed to share results");
			console.error("Sharing failed:", error);
		}
	};

	return (
		<div className="bg-gradient-to-br from-indigo-600 to-pink-500 rounded-xl p-6 text-white">
			<div className="text-center space-y-4">
				<h2 className="text-2xl font-bold">
					{quiz.title}
				</h2>

				<div className="text-5xl font-bold">
					{score}
					<span className="text-2xl">
						/{quiz.num_questions}
					</span>
				</div>

				<div className="text-lg">
					<span className="font-bold">
						{user?.user_metadata?.name || "You"}
					</span>{" "}
					scored {percentage}%
				</div>


				<div className="text-sm space-y-1">
					<div>Topic: {quiz.topic}</div>
					{quiz.difficulty && (
						<div>
							Difficulty: {quiz.difficulty}
						</div>
					)}
				</div>

				<Button
					onClick={handleShare}
					className="w-full mt-4 gap-2 bg-white text-indigo-600 hover:bg-gray-100"
				>
					<Share2 className="w-5 h-5" />
					Share Results
				</Button>
			</div>
		</div>
	);
};
