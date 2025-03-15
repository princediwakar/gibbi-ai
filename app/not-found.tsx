"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Home,
	Search,
	ClipboardList,
	CheckCircle,
	XCircle,
	RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function NotFound() {
	const [selectedAnswer, setSelectedAnswer] = useState<
		string | null
	>(null);
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const correctAnswers = ["b", "c", "d"];

	const handleAnswer = (answer: string) => {
		setSelectedAnswer(answer);
		setIsCorrect(correctAnswers.includes(answer));
		setShowResult(true);
		if (
			correctAnswers.includes(answer) &&
			["c", "d"].includes(answer)
		) {
			setTimeout(() => {
				window.location.href =
					answer === "c" ? "/quizzes" : "/";
			}, 1000);
		}
	};

	const handleTryAgain = () => {
		setSelectedAnswer(null);
		setShowResult(false);
		setIsCorrect(false);
	};

	return (
		<div className="flex flex-col items-center justify-center p-4">
			<div className="max-w-md w-full space-y-6">
				{/* Header */}
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.3 }}
					className="text-center space-y-3"
				>
					<h1 className="text-6xl font-bold text-primary">
						404
					</h1>
					<h2 className="text-2xl font-semibold text-foreground">
						Page Not Found
					</h2>
				</motion.div>

				{/* Quiz */}
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{
						delay: 0.2,
						duration: 0.3,
					}}
					className="bg-card rounded-lg shadow-sm p-5 space-y-5 border"
				>
					<div className="flex items-center gap-2">
						<ClipboardList className="w-5 h-5 text-primary" />
						<h3 className="text-lg font-semibold text-foreground">
							Quick Quiz
						</h3>
					</div>

					<p className="text-base text-muted-foreground">
						What should you do when you see a
						404 error?
					</p>

					<div className="space-y-3">
						{[
							{
								id: "a",
								text: "Panic and refresh repeatedly",
							},
							{
								id: "b",
								text: "Check the URL for typos",
							},
							{
								id: "c",
								text: "Explore other quizzes",
							},
							{ id: "d", text: "Go Home" },
						].map((option) => (
							<button
								key={option.id}
								onClick={() =>
									handleAnswer(option.id)
								}
								disabled={
									showResult &&
									!correctAnswers.includes(
										option.id
									)
								}
								className={`w-full p-3 rounded-md text-left text-base transition-all
                  ${
						selectedAnswer === option.id
							? correctAnswers.includes(
									option.id
							  )
								? "bg-primary/10 border-primary"
								: "bg-destructive/10 border-destructive"
							: "bg-muted hover:bg-muted/50 border border-transparent"
					} border`}
							>
								{option.text}
							</button>
						))}
					</div>

					{showResult && (
						<motion.div
							initial={{
								scale: 0.8,
								opacity: 0,
							}}
							animate={{
								scale: 1,
								opacity: 1,
							}}
							className={`p-3 rounded-md flex items-center gap-3 text-sm ${
								isCorrect
									? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
									: "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100"
							}`}
						>
							{isCorrect ? (
								<CheckCircle className="w-4 h-4" />
							) : (
								<XCircle className="w-4 h-4" />
							)}
							<p>
								{isCorrect
									? "Good choice!"
									: "Not quite! Try again."}
							</p>
							{!isCorrect && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleTryAgain}
									className="ml-auto gap-1 px-2"
								>
									<RefreshCw className="w-3 h-3" />
									Try Again
								</Button>
							)}
						</motion.div>
					)}
				</motion.div>

				{/* Navigation */}
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{
						delay: 0.4,
						duration: 0.3,
					}}
					className="flex gap-3 justify-center"
				>
					<Button asChild className="gap-2">
						<Link href="/">
							<Home className="w-4 h-4" />
							Go Home
						</Link>
					</Button>
					<Button
						variant="outline"
						asChild
						className="gap-2"
					>
						<Link href="/quizzes">
							<Search className="w-4 h-4" />
							Explore Quizzes
						</Link>
					</Button>
				</motion.div>
			</div>
		</div>
	);
}
