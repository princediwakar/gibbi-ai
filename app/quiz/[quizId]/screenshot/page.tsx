"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { QuizPlayer } from "@/app/quiz/QuizPlayer";
import { getQuizWithQuestions } from "@/lib/getQuizWithQuestions";
import { Quiz } from "@/types/quiz";

export default function ScreenshotPage({
	params,
}: {
	params: Promise<{ quizId: string }>;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [quiz, setQuiz] = useState<Quiz | null>(null);

	useEffect(() => {
		// Fetch quiz data
		const fetchQuiz = async () => {
			const { quizId } = await params;

			const quizData = await getQuizWithQuestions(
				quizId
			);
			setQuiz(quizData);
		};

		fetchQuiz();
	}, [params]);

	useEffect(() => {
		if (!quiz || !containerRef.current) return;

		const captureScreenshot = async () => {
			const canvas = await html2canvas(
				containerRef.current!,
				{
					useCORS: true,
					scale: 2,
					logging: true,
				}
			);

			// Convert canvas to data URL
			const dataUrl = canvas.toDataURL("image/png");

			// Send the screenshot back to the parent window
			window.parent.postMessage(
				{ type: "SCREENSHOT_READY", dataUrl },
				"*"
			);
		};

		captureScreenshot();
	}, [quiz]);

	if (!quiz) {
		return <div>Loading...</div>;
	}

	return (
		<div
			ref={containerRef}
			className="w-[1200px] h-[630px]"
		>
			<QuizPlayer quiz={quiz} />
		</div>
	);
}
