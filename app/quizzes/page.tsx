'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PublicQuizzes() {
	const [quizzes, setQuizzes] = useState([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		async function fetchQuizzes() {
			try {
				const res = await fetch(
					"/api/quizzes/get",
					{
						method: "POST",
						headers: {
							"Content-Type":
								"application/json",
						},
						body: JSON.stringify({
							type: "public",
						}),
					}
				);
				const data = await res.json();
				if (data.quizzes) setQuizzes(data.quizzes);
			} catch (error) {
				console.error(
					"Failed to fetch quizzes",
					error
				);
			} finally {
				setLoading(false);
			}
		}
		fetchQuizzes();
	}, []);

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">
				Public Quizzes
			</h1>
			{loading ? (
				<p>Loading quizzes...</p>
			) : quizzes.length === 0 ? (
				<p>No public quizzes available.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{quizzes.map((quiz) => (
						<Card
							key={quiz.quiz_id}
							className="p-4 cursor-pointer"
							onClick={() =>
								router.push(
									`/quiz/${quiz.quiz_id}`
								)
							}
						>
							<CardContent>
								<h2 className="text-lg font-semibold">
									{quiz.title}
								</h2>
								<p className="text-sm text-gray-600">
									{quiz.description}
								</p>
								<Button
									className="mt-2"
									variant="outline"
									onClick={() =>
										router.push(
											`/quiz/${quiz.quiz_id}`
										)
									}
								>
									Take Quiz
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
