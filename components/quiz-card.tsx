"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types/quiz";
import { downloadQuiz } from "@/lib/downloadQuiz";
import { Pencil } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	Loader2,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { deleteQuiz } from "@/lib/queries";
import { toast } from "sonner";
import { useRouter } from "next/navigation";



interface QuizCardProps {
	quiz: Quiz;
	onDelete?: (quizId: string) => void;
	onUpdate?: (updatedQuiz: Quiz) => void;
}



export function QuizCard({
	quiz,
	onDelete,
}: QuizCardProps) {
	const user = useUser();
	const isOwner = user?.id === quiz.creator_id;
	const [isDeleting, setIsDeleting] = useState(false);
	  const [isDeleted, setIsDeleted] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
		useState(false);

	const router = useRouter()


	const handleDownload = async (
		format: "pdf" | "excel"
	) => {
		try {
			await downloadQuiz(quiz, format);
		} catch (error) {
			console.error("Error downloading quiz:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to download quiz"
			);
		}
	};

	const handleShare = (platform: string) => {
		const shareUrl = encodeURIComponent(
			`${window.location.origin}/quiz/${quiz.slug}`
		);
		const shareText = encodeURIComponent(
			`Check out this quiz: ${quiz.title}`
		);

		switch (platform) {
			case "twitter":
				window.open(
					`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
					"_blank"
				);
				break;
			case "facebook":
				window.open(
					`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
					"_blank",
					"width=600,height=400"
				);
				break;
			case "whatsapp":
				window.open(
					`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`,
					"_blank"
				);
				break;
			default:
				break;
		}
	};


	
	const handleDelete = async () => {
		if (!isOwner || !user) return;

		try {
			setIsDeleting(true);
			await deleteQuiz(quiz.quiz_id, user.id);
			setIsDeleted(true);
			toast.success("Quiz deleted successfully");

			// Call the onDelete callback if provided
			if (onDelete) {
				onDelete(quiz.quiz_id);
			}
		} catch (error) {
			console.error(
				"Error deleting quiz:",
				error
			);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete quiz"
			);
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
		}
	};

		// Don't render if deleted
		if (isDeleted) {
			return null;
		}
	return (
		<div className="border rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
			<div className="flex-1">
				<h2 className="text-xl font-semibold mb-2 line-clamp-2">
					{quiz.title}
				</h2>
				<div className="text-sm text-gray-600 mb-4 space-y-2">
					<p className="">
						{quiz.question_count && (
							<span>
								{quiz.question_count}{" "}
								questions •{" "}
							</span>
						)}
						{quiz.topic}
					</p>
					{quiz.creator_name && (
						<p className="text-xs text-gray-500 mt-1">
							Created by: {quiz.creator_name}
						</p>
					)}
					<p className="line-clamp-3 min-h-[60px]">
						{quiz.description ||
							"No description available"}
					</p>
				</div>
			</div>

			<div className="flex gap-2 mt-auto">
				<Button asChild className="flex-1">
					<Link href={`/quiz/${quiz.slug}`}>
						View Quiz
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
						{isOwner && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() =>
										router.push(`/quiz/${quiz.slug}/?edit=true`)
									}
								>
									<Pencil className="mr-2 h-4 w-4" />
									<span>Edit Quiz</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-red-600 focus:text-red-700 focus:bg-red-50"
									onClick={() =>
										setIsDeleteDialogOpen(
											true
										)
									} // Changed from handleDelete to open dialog
									disabled={isDeleting}
								>
									{isDeleting ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<Trash2 className="mr-2 h-4 w-4" />
									)}
									<span>
										{isDeleting
											? "Deleting..."
											: "Delete Quiz"}
									</span>
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>


				{/* Delete Confirmation Dialog */}
				<Dialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								Delete Quiz
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<p>
								Are you sure you want to
								delete this quiz?
							</p>
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									onClick={() =>
										setIsDeleteDialogOpen(
											false
										)
									}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={handleDelete}
									disabled={isDeleting}
								>
									{isDeleting ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										"Delete"
									)}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
