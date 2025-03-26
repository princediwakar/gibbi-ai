"use client";

import { Quiz } from "@/types/quiz";
// import { Button } from "@/components/ui/button";
// import { Share2 } from "lucide-react";
// import { toast } from "sonner";
// import { useCopyToClipboard } from "usehooks-ts";
import { useUser } from "@/hooks/useUser";

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
	const {user} = useUser();
	

	return (
		<div className="bg-gradient-to-br from-indigo-600 to-pink-500 rounded-xl p-6 text-white">
			<div className="text-center space-y-4">
				<h2 className="text-2xl font-bold">
					{quiz.title}
				</h2>

				<div className="text-5xl font-bold">
					{score}
					<span className="text-2xl">
						/{quiz.question_count}
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

				{/* 				<Button
					onClick={handleShare}
					className="w-full mt-4 gap-2 bg-white text-indigo-600 hover:bg-gray-100"
				>
					<Share2 className="w-5 h-5" />
					Share Results
				</Button> */}
			</div>
		</div>
	);
};
