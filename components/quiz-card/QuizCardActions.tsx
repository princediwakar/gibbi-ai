// components/quiz/QuizCardActions.tsx
import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Quiz, User } from "@/types/quiz";
import { downloadQuiz } from "@/lib/downloadQuiz";
import {
  Pencil,
  Download,
  Twitter,
  Facebook,
  MessageCircle,
  Loader2,
  Trash2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";


interface QuizCardActionsProps {
  quiz: Quiz;
  isCreator: boolean;
  user: User | null; // Replace with proper user type
  isDeleting: boolean;
  setIsDeleting: (value: boolean) => void;
  setIsDeleted: (value: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  onDelete?: (quizId: string) => void; // Made optional
}

export const QuizCardActions: FC<QuizCardActionsProps> = ({
  quiz,
  isCreator,
  user,
  isDeleting,
  setIsDeleting,
  setIsDeleted,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onDelete,
}) => {
  const router = useRouter();

  const handleDownload = async (format: "pdf" | "excel") => {
    try {
      await downloadQuiz(quiz, format);
      toast.success(`Your ${format} file is being downloaded.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download quiz");
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = encodeURIComponent(`${window.location.origin}/quiz/${quiz.slug}`);
    const shareText = encodeURIComponent(`Check out this quiz: ${quiz.title}`);

    const shareLinks = {
      twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`,
    };

    window.open(
      shareLinks[platform as keyof typeof shareLinks],
      "_blank",
      platform === "facebook" ? "width=600,height=400" : undefined
    );
  };

  const handleDelete = async () => {
    if (!isCreator || !user) return;

    try {
      setIsDeleting(true);
      const response = await fetch("/api/quiz/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies
        body: JSON.stringify({ quizId: quiz.quiz_id, userId: user.id }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to delete quiz");
      }

      setIsDeleted(true);
      toast.success("Quiz deleted successfully");

      if (onDelete) await onDelete(quiz.quiz_id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete quiz");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 mt-6">
        <Button asChild variant="default" className="flex-1">
          <Link href={isCreator ? `/quiz/${quiz.slug}` : `/quiz/${quiz.slug}`}>View Quiz</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
              <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("twitter")}>
              <Twitter className="mr-2 h-4 w-4 text-blue-400" />
              Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("facebook")}>
              <Facebook className="mr-2 h-4 w-4 text-blue-600" />
              Facebook
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDownload("pdf")}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("excel")}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </DropdownMenuItem>
            {isCreator && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(`/edit/${quiz.slug}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{quiz.title}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};