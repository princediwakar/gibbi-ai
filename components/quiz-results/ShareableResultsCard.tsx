"use client";

import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { useUser } from "@/hooks/useUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { flattenQuizQuestions } from "@/lib/quiz-utils";

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
  const { user } = useUser();
  const [, copy] = useCopyToClipboard();

  // Determine total number of questions (fallback to flattening if field missing)
  const questionTotal = quiz.question_count ?? flattenQuizQuestions(quiz).length;

  const handleShare = (platform: "twitter" | "facebook" | "whatsapp") => {
    const quizUrl = window.location.href; // Get the current quiz URL
    const shareText = `${user?.user_metadata?.name || "I"} scored ${score}/${
      questionTotal
    } (${percentage}%) on "${quiz.title}"! Topic: ${quiz.topic}
    \n\nTake the quiz or create your own: ${quizUrl}`;

    // Copy to clipboard
    copy(shareText)
      .then(() => toast.success("Results copied to clipboard!"))
      .catch(() => toast.error("Failed to copy results."));

    // Share on the selected platform
    switch (platform) {
      case "twitter":
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `${user?.user_metadata?.name || "I"} scored ${score}/${
            questionTotal
          } (${percentage}%) on "${quiz.title}"! Topic: ${quiz.topic}${
            quiz.difficulty ? `, Difficulty: ${quiz.difficulty}` : ""
          }\n\nTake the quiz or create your own:`
        )}&url=${encodeURIComponent(quizUrl)}`;
        window.open(twitterUrl, "_blank");
        break;
      case "facebook":
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(quizUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, "_blank");
        break;
      case "whatsapp":
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, "_blank");
        break;
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          {quiz.title}
        </h2>

        <div className="text-5xl font-bold text-primary">
          {score}
          <span className="text-2xl text-muted-foreground">/{questionTotal}</span>
        </div>

        <div className="text-lg text-foreground">
          <span className="font-bold">
            {user?.user_metadata?.name || "You"}
          </span>{" "}
          scored <span className="text-primary">{percentage}%</span>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <div>Topic: {quiz.topic}</div>
          {quiz.difficulty && (
            <div>Difficulty: {quiz.difficulty}</div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full mt-4 gap-2 bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">
              <Share2 className="w-5 h-5" />
              Share Results
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => handleShare("twitter")}>
              <Twitter className="w-4 h-4 mr-2" />
              Share on Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("facebook")}>
              <Facebook className="w-4 h-4 mr-2" />
              Share on Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Share on WhatsApp
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};