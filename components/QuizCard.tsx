"use client";

import { Quiz } from "@/types/quiz";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Sheet } from "lucide-react";
import { downloadQuiz } from "@/lib/downloadQuiz";

export const QuizCard = ({ quiz }: { quiz: Quiz }) => {
	const handleDownload = (format: "pdf" | "excel") => {
		downloadQuiz(quiz, format);
	};

	return (
		<Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
			<div className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-6">
				<div className="flex-1 space-y-3">
					<CardHeader className="p-0">
						<CardTitle className="text-xl font-semibold text-gray-800">
							{quiz.title || "Untitled Quiz"}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 space-y-2">
						<div className="flex flex-wrap gap-3">
							<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
								<span>
									{quiz.topic ||
										"General"}
								</span>
							</div>
							<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
								<span>
									{quiz.difficulty ||
										"N/A"}
								</span>
							</div>
							<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
								<span className="font-medium">
									Questions:
								</span>
								<span>
									{quiz.num_questions ||
										0}
								</span>
							</div>
						</div>
					</CardContent>
				</div>
				<div className="w-full sm:w-auto flex flex-col gap-2">
					<Link
						prefetch={false}
						href={`/quiz/${quiz.quiz_id}`}
						className="w-full sm:w-auto"
					>
						<Button
							variant="default"
							className="w-full sm:w-32 h-11"
						>
							View Quiz
						</Button>
					</Link>
					<div className="flex ">
						<Button
							variant="ghost"
							size="sm"
							// className="gap-2"
							onClick={() =>
								handleDownload("excel")
							}
						>
							<Sheet className="h-4 w-4" />
							Excel
						</Button>
						<Button
							variant="ghost"
							size="sm"
							// className="gap-2"
							onClick={() =>
								handleDownload("pdf")
							}
						>
							<FileText className="h-4 w-4" />
							PDF
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
};
