"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types/quiz";
import { downloadQuiz } from "@/lib/downloadQuiz";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Download,
	Share2,
	Twitter,
	Facebook,
	MessageCircle,
} from "lucide-react";

interface QuizCardProps {
	quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
	const handleDownload = async (
		format: "pdf" | "excel"
	) => {
		await downloadQuiz(quiz, format);
	};

	const handleShare = (platform: string) => {
		const shareUrl = `${window.location.origin}/quiz/${quiz.quiz_id}`;
		const shareText = `Check out this quiz: ${quiz.title}`;

		switch (platform) {
			case "twitter":
				window.open(
					`https://twitter.com/intent/tweet?text=${encodeURIComponent(
						shareText
					)}&url=${encodeURIComponent(shareUrl)}`,
					"_blank"
				);
				break;
			case "facebook":
				window.open(
					`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
						shareUrl
					)}`,
					"_blank"
				);
				break;
			case "whatsapp":
				window.open(
					`https://api.whatsapp.com/send?text=${encodeURIComponent(
						`${shareText} ${shareUrl}`
					)}`,
					"_blank"
				);
				break;
		}
	};

	return (
		<div className="border rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
			<div className="flex-1">
				<h2 className="text-xl font-semibold mb-2 line-clamp-2">
					{quiz.title}
				</h2>
				<div className="text-sm text-gray-600 mb-4">
					<p className="line-clamp-3 min-h-[60px]">
						{quiz.description ||
							"No description available"}
					</p>
					<p className="mt-2">
						{quiz.num_questions} questions •{" "}
						{quiz.topic}
					</p>
					{quiz.creatorName && (
						<p className="text-xs text-gray-500 mt-1">
							Created by: {quiz.creatorName}
						</p>
					)}
				</div>
			</div>

			<div className="flex gap-2 mt-auto">
				<Button asChild className="flex-1">
					<Link href={`/quiz/${quiz.quiz_id}`}>
						Take Quiz
					</Link>
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="icon"
						>
							<Share2 className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-56"
					>
						{/* Share Section */}
						<DropdownMenuItem
							onClick={() =>
								handleShare("whatsapp")
							}
						>
							<MessageCircle className="mr-2 h-4 w-4 text-green-500" />
							<span>Share on WhatsApp</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								handleShare("twitter")
							}
						>
							<Twitter className="mr-2 h-4 w-4 text-blue-400" />
							<span>Share on Twitter</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								handleShare("facebook")
							}
						>
							<Facebook className="mr-2 h-4 w-4 text-blue-600" />
							<span>Share on Facebook</span>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						{/* Download Section */}
						<DropdownMenuItem
							onClick={() =>
								handleDownload("pdf")
							}
						>
							<Download className="mr-2 h-4 w-4" />
							<span>Download as PDF</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								handleDownload("excel")
							}
						>
							<Download className="mr-2 h-4 w-4" />
							<span>Download as Excel</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
