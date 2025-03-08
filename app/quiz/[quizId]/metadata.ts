import { Metadata } from "next";
import { Quiz } from "@/types/quiz";
import { supabase } from "@/lib/supabase/client";

export async function generateMetadata({
	params,
}: {
	params: { quizId: string };
}): Promise<Metadata> {
	const { data: quiz } = await supabase
		.from("quizzes")
		.select("*")
		.eq("quiz_id", params.quizId)
		.single();

	if (!quiz) {
		return {
			title: "Quiz Not Found",
		};
	}

	return {
		title: `${quiz.title} - Quiz App`,
		description:
			quiz.description ||
			`Take the ${quiz.title} quiz on Quiz App`,
		openGraph: {
			title: quiz.title,
			description:
				quiz.description ||
				`Take the ${quiz.title} quiz on Quiz App`,
			images: [
				{
					url: `/api/og?title=${encodeURIComponent(
						quiz.title
					)}`,
					width: 1200,
					height: 630,
				},
			],
		},
	};
}


