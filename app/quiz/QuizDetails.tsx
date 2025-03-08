"use client";

import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuizDetailsProps {
	quiz: Quiz;
	onStart: () => void;
}

export function QuizDetails({
	quiz,
	onStart,
}: QuizDetailsProps) {
	const router = useRouter()
	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">
				{quiz.title}
			</h1>
			<p className="text-gray-600">
				Created by: {quiz.creatorName}
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
						{quiz.num_questions || 0}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<Link href="/">
					<Button
						className="w-full"
						variant="secondary"
						onClick={() => router.push("/")}
					>
						Back to Home
					</Button>
				</Link>
				<Button onClick={onStart}>
					Start Quiz
				</Button>
			</div>
		</div>
	);
}
