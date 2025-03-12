"use client";

import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuizOverflowMenuProps {
	quizId: string;
}

export function QuizOverflowMenu({
	quizId,
}: QuizOverflowMenuProps) {
const handleCopyEmbedCode = () => {
	navigator.clipboard.writeText(
		`<iframe 
      src="${window.location.origin}/quiz/${quizId}/embed"
      width="100%" 
      height="600px"
      style="border:none;"
      allow="autoplay; fullscreen"
    ></iframe>`
	);
	toast.success("Embed code copied to clipboard!");
};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<EllipsisVertical className="h-5 w-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={handleCopyEmbedCode}
				>
					Copy Embed Code
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
