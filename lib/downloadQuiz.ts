import { toast } from "sonner";
import { utils, writeFile } from "xlsx";
import { supabase } from "@/lib/supabase/client";
import { saveAs } from "file-saver";
import { Quiz } from "@/types/quiz";

interface Question {
	question_text: string;
	options: Record<string, string>;
	correct_option: string;
}

interface ExcelQuestion {
	Question: string;
	[key: string]: string | undefined;
	"Correct Answer": string;
}

export const downloadQuiz = async (
	quiz: Quiz,
	format: "pdf" | "excel"
) => {
	const toastId = toast.loading("Starting download...");

	try {
		const { data: questions, error } = await supabase
			.from("questions")
			.select("*")
			.eq("quiz_id", quiz.quiz_id);

		if (error)
			throw new Error("Failed to fetch questions");
		if (!questions || questions.length === 0)
			throw new Error("No questions found");

		if (format === "excel") {
			toast.loading("Generating Excel file...", {
				id: toastId,
			});

			const worksheet = utils.json_to_sheet(
				questions.map((q: Question) => {
					const excelQuestion: ExcelQuestion = {
						Question: q.question_text,
						"Correct Answer": q.correct_option,
					};

					Object.entries(q.options).forEach(
						([key, value]) => {
							excelQuestion[
								`Option ${key.toUpperCase()}`
							] = value;
						}
					);

					return excelQuestion;
				})
			);

			const workbook = utils.book_new();
			utils.book_append_sheet(
				workbook,
				worksheet,
				"Quiz"
			);
			writeFile(workbook, `${quiz.title}.xlsx`);

			toast.success(
				`Quiz downloaded in Excel format`,
				{ id: toastId }
			);
		} else {
			toast.loading("Generating PDF file...", {
				id: toastId,
			});

			const pdfResponse = await fetch(
				"/api/generate-pdf",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						quiz: {
							title: quiz.title,
							description: quiz.description,
							topic: quiz.topic,
							subject: quiz.subject,
							question_count:
								quiz.question_count,
						},
						questions: questions,
						filename: `${quiz.title}.pdf`,
					}),
				}
			);

			if (!pdfResponse.ok)
				throw new Error("Failed to generate PDF");
			const blob = await pdfResponse.blob();
			saveAs(blob, `${quiz.title}.pdf`);

			toast.success(`Quiz downloaded in PDF format`, {
				id: toastId,
			});
		}
	} catch (error) {
		toast.error(
			error instanceof Error
				? error.message
				: "Failed to download quiz",
			{ id: toastId }
		);
	}
};
