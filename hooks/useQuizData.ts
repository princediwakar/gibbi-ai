import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Quiz } from "@/types/quiz";

export const useQuizData = () => {
	// Fetch session
	const { data: session } = useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			return session;
		},
	});

	// Fetch quizzes with their questions
	const {
		data: savedQuizzes,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["saved-quizzes"],
		queryFn: async () => {
			// First get the quizzes
			const quizzesQuery = supabase
				.from("quizzes")
				.select("*")
				.order("created_at", { ascending: false });

			if (session?.user?.id) {
				quizzesQuery.or(
					`creator_id.eq.${session.user.id},is_public.eq.true`
				);
			} else {
				quizzesQuery.eq("is_public", true);
			}

			const { data: quizzes, error: quizzesError } =
				await quizzesQuery;
			if (quizzesError) throw quizzesError;

			// For each quiz, fetch its questions
			const quizzesWithQuestions = await Promise.all(
				quizzes.map(async (quiz) => {
					const {
						data: questions,
						error: questionsError,
					} = await supabase
						.from("questions")
						.select("*")
						.eq("quiz_id", quiz.quiz_id);

					if (questionsError)
						throw questionsError;

					return {
						...quiz,
						questions: questions.map((q) => ({
							...q,
							options: q.options as string[], // options is stored as JSONB in Supabase
						})),
					};
				})
			);

			return quizzesWithQuestions as Quiz[];
		},
		enabled: true,
	});

	return {
		session,
		savedQuizzes,
		isLoading,
		refetch,
	};
};
