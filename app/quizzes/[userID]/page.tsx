import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";



export default function UserQuizzes() {
	const router = useRouter();
	const { id } = router.query;
	const [quizzes, setQuizzes] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		async function fetchUserQuizzes() {
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
							type: "specificUser",
							user_id: id,
						}),
					}
				);
				const data = await res.json();
				if (data.quizzes) setQuizzes(data.quizzes);
			} catch (error) {
				console.error(
					"Failed to fetch user quizzes",
					error
				);
			} finally {
				setLoading(false);
			}
		}
		fetchUserQuizzes();
	}, [id]);

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">
				User's Quizzes
			</h1>
			{loading ? (
				<p>Loading quizzes...</p>
			) : quizzes.length === 0 ? (
				<p>No quizzes available for this user.</p>
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
