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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { supabase } from "@/lib/supabase/client";



interface QuizCardProps {
	quiz: Quiz;
	onDelete?: (quizId: string) => void;
	onUpdate?: (updatedQuiz: Quiz) => void;
}



export function QuizCard({
	quiz,
	onDelete,
	onUpdate,
}: QuizCardProps) {
	const user = useUser();
	const isOwner = user?.id === quiz.creator_id;
	const [isDeleting, setIsDeleting] = useState(false);
	  const [isDeleted, setIsDeleted] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
		useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState({
		title: quiz.title,
		description: quiz.description,
		topic: quiz.topic,
		subject: quiz.subject,
		difficulty: quiz.difficulty,
	});
	  

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
			default:
				break;
		}
	};

	const handleEdit = async () => {
		if (!isOwner || !user) return;

		// Create a copy of the current quiz data in case we need to revert
		const originalQuiz = { ...quiz };

		try {
			// Optimistically update local state
			if (onUpdate) {
				onUpdate({ ...quiz, ...editData });
			}

			// Make the API call
			const { error } = await supabase
				.from("quizzes")
				.update(editData)
				.eq("quiz_id", quiz.quiz_id);

			if (error) throw error;

			setIsEditing(false);
			toast.success("Quiz updated successfully");
		} catch (error) {
			console.error("Error updating quiz:", error);

			// Revert to original state if update fails
			if (onUpdate) {
				onUpdate(originalQuiz);
			}

			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update quiz"
			);
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
						{quiz.question_count} questions •{" "}
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
										setIsEditing(true)
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

				{/* Edit Dialog */}

				<Dialog
					open={isEditing}
					onOpenChange={setIsEditing}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								Edit Quiz
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label>Title</Label>
								<Input
									value={editData.title}
									onChange={(e) =>
										setEditData({
											...editData,
											title: e.target
												.value,
										})
									}
								/>
							</div>
							<div>
								<Label>Description</Label>
								<Input
									value={
										editData.description
									}
									onChange={(e) =>
										setEditData({
											...editData,
											description:
												e.target
													.value,
										})
									}
								/>
							</div>
							<div>
								<Label>Topic</Label>
								<Input
									value={editData.topic}
									onChange={(e) =>
										setEditData({
											...editData,
											topic: e.target
												.value,
										})
									}
								/>
							</div>
							<div>
								<Label>Subject</Label>
								<Input
									value={editData.subject}
									onChange={(e) =>
										setEditData({
											...editData,
											subject:
												e.target
													.value,
										})
									}
								/>
							</div>
							<div>
								<Label>Difficulty</Label>
								<Select
									value={
										editData.difficulty
									}
									onValueChange={(
										value
									) =>
										setEditData({
											...editData,
											difficulty:
												value,
										})
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select difficulty" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Beginner">
											Beginner
										</SelectItem>
										<SelectItem value="Intermediate">
											Intermediate
										</SelectItem>
										<SelectItem value="Advanced">
											Advanced
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Button onClick={handleEdit}>
								Save Changes
							</Button>
						</div>
					</DialogContent>
				</Dialog>

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
