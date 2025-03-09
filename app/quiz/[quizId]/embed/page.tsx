import { QuizPlayer } from "@/app/quiz/QuizPlayer";
import { notFound } from "next/navigation";
import { getQuizData } from "@/lib/getQuizData";

export default async function EmbedPage({
	params,
}: {
	params: Promise<{ quizId: string }>;
}) {
	const { quizId } = await params;
	const data = await getQuizData(quizId);

	if (!data) {
		return notFound();
	}

	const quizWithQuestions = {
		...data.quiz,
		creatorName: data.creatorName,
		questions: data.questions,
	};

	return (
		<div className="min-h-[600px] w-full p-4">
			<QuizPlayer
				quiz={quizWithQuestions}
				embedMode
			/>
		</div>
	);
}
