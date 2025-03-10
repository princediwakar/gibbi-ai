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
		const fetchQuiz = async () => {
            const {quizId} = await params
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
			try {
				const canvas = await html2canvas(
					containerRef.current!,
					{
						useCORS: true,
						scale: 2,
						logging: true,
						backgroundColor: "#ffffff",
					}
				);

				const dataUrl =
					canvas.toDataURL("image/png");
				window.parent.postMessage(
					{ type: "SCREENSHOT_READY", dataUrl },
					"*"
				);
			} catch (error) {
				console.error(
					"Failed to capture screenshot:",
					error
				);
			}
		};

		captureScreenshot();
	}, [quiz]);

	if (!quiz) {
		return (
			<div className="w-[1200px] h-[630px] flex items-center justify-center bg-white">
				<div>Loading quiz...</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="w-[1200px] h-[630px] bg-white p-8"
		>
			<QuizPlayer quiz={quiz} />
		</div>
	);
}
