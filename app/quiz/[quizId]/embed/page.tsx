 import { QuizPlayer } from "@/app/quiz/QuizPlayer";
 import { notFound } from "next/navigation";
 import { getQuizWithQuestions } from "@/lib/getQuizWithQuestions";

 export default async function EmbedPage({
		params,
 }: {
		params: Promise<{ quizId: string }>;
 }) {
		const { quizId } = await params;
		const quiz = await getQuizWithQuestions(quizId);

		if (!quiz) {
			return notFound();
		}

		return (
			<div className="min-h-[600px] w-full">
				<QuizPlayer quiz={quiz} embedMode />
			</div>
		);
 }