 "use client";

 import { Quiz } from "@/types/quiz";
 import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
 } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import Link from "next/link";

 import { getUserDetails } from "@/lib/getUserDetails";
 import { useEffect, useState } from "react";

 export const QuizCard = ({ quiz }: { quiz: Quiz }) => {
		const [creatorName, setCreatorName] =
			useState("Loading...");

		useEffect(() => {
			const fetchCreator = async () => {
				if (quiz.creator_id) {
					const name = await getUserDetails(
						quiz.creator_id
					);
					setCreatorName(name);
				}
			};
			fetchCreator();
		}, [quiz.creator_id]);
		return (
			<Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
				<div className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-6">
					<div className="flex-1 space-y-3">
						<CardHeader className="p-0">
							<CardTitle className="text-xl font-semibold text-gray-800">
								{quiz.title ||
									"Untitled Quiz"}
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0 space-y-2">
							<div className="text-sm text-gray-500">
								Created by: {creatorName}
							</div>
							<div className="flex flex-wrap gap-3">
								<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
									<span>
										{quiz.topic ||
											"General"}
									</span>
								</div>
								<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
									<span>
										{quiz.difficulty ||
											"N/A"}
									</span>
								</div>
								<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
									<span className="font-medium">
										Questions:
									</span>
									<span>
										{quiz.num_questions ||
											0}
									</span>
								</div>
							</div>
						</CardContent>
					</div>
					<div className="w-full sm:w-auto">
						<Link
							// prefetch={false}
							href={`/quiz/${quiz.quiz_id}`}
							className="w-full sm:w-auto"
						>
							<Button
								variant="outline"
								className="w-full sm:w-32 h-11"
							>
								Start Quiz
							</Button>
						</Link>
					</div>
				</div>
			</Card>
		);
 };