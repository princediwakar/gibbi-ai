"use client";

import { Button } from "@/components/ui/button";
import {
	Share2,
	Twitter,
	Facebook,
	MessageSquare,
} from "lucide-react";

interface ShareButtonsProps {
	quiz: {
		title: string;
		quiz_id: string;
	};
}

export const ShareButtons = ({
	quiz,
}: ShareButtonsProps) => {
	const shareUrl = `${window.location.origin}/quiz/${quiz.quiz_id}`;
	const shareText = `Check out this quiz: ${quiz.title}`;

	const shareOnTwitter = () => {
		window.open(
			`https://twitter.com/intent/tweet?text=${encodeURIComponent(
				shareText
			)}&url=${encodeURIComponent(shareUrl)}`,
			"_blank"
		);
	};

	const shareOnFacebook = () => {
		window.open(
			`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
				shareUrl
			)}`,
			"_blank"
		);
	};

	const shareOnWhatsApp = () => {
		window.open(
			`https://api.whatsapp.com/send?text=${encodeURIComponent(
				`${shareText} ${shareUrl}`
			)}`,
			"_blank"
		);
	};

	return (
		<div className="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={shareOnTwitter}
			>
				<Twitter className="w-4 h-4 mr-2" />
				Twitter
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={shareOnFacebook}
			>
				<Facebook className="w-4 h-4 mr-2" />
				Facebook
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={shareOnWhatsApp}
			>
				<MessageSquare className="w-4 h-4 mr-2" />
				WhatsApp
			</Button>
		</div>
	);
};
