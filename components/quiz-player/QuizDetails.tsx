import { Quiz } from "@/types/quiz";

interface QuizDetailsProps {
	quiz: Quiz;
	// onStart: () => void;
}

export function QuizDetails({
	quiz,
	// onStart,
}: QuizDetailsProps) {
	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">
				{quiz.title}
			</h1>
			<p className="text-gray-600">
				Created by: {quiz.creator_name || "Unknown"}
			</p>

			{quiz.description && (
				<p className="text-gray-600">
					{quiz.description}
				</p>
			)}

			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col space-y-1">
					<span className="text-sm text-gray-500">
						Subject
					</span>
					<span className="font-medium">
						{quiz.subject || "General"}
					</span>
				</div>
				<div className="flex flex-col space-y-1">
					<span className="text-sm text-gray-500">
						Topic
					</span>
					<span className="font-medium">
						{quiz.topic || "General"}
					</span>
				</div>
				<div className="flex flex-col space-y-1">
					<span className="text-sm text-gray-500">
						Difficulty
					</span>
					<span className="font-medium">
						{quiz.difficulty || "N/A"}
					</span>
				</div>
				<div className="flex flex-col space-y-1">
					<span className="text-sm text-gray-500">
						Questions
					</span>
					<span className="font-medium">
						{quiz.question_count || 0}
					</span>
				</div>
			</div>
		</div>
	);
}
