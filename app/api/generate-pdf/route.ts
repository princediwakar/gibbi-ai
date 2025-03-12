import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface PdfRequest {
	quiz: {
		title: string;
		description?: string;
		topic?: string;
		subject?: string;
		num_questions?: number;
	};
	questions: Array<{
		question_text: string;
		options: Record<string, string>;
		correct_option: string;
	}>;
	filename: string;
}

type PDFFont = {
	widthOfTextAtSize: (
		text: string,
		size: number
	) => number;
};

export async function POST(req: NextRequest) {
	try {
		const { quiz, questions, filename } =
			(await req.json()) as PdfRequest;

		// Create a new PDF document
		const pdfDoc = await PDFDocument.create();

		// Helper function to add a new page with common settings
		const addNewPage = () => {
			const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
			const y = 800; // Start from top of page
			return { page, y };
		};

		// Embed fonts
		const font = await pdfDoc.embedFont(
			StandardFonts.Helvetica
		);
		const boldFont = await pdfDoc.embedFont(
			StandardFonts.HelveticaBold
		);

		// Layout settings
		const margin = 50;
		const titleSize = 18;
		const subtitleSize = 14;
		const questionSize = 12;
		const optionSize = 10;
		const lineHeight = 14;
		const optionIndent = 20;

		// Add quiz content
		let { page, y } = addNewPage();

		// Add quiz title
		const titleLines = wrapText(
			quiz.title || "Quiz Paper",
			495.28, // max width
			boldFont,
			titleSize
		);

		for (const line of titleLines) {
			page.drawText(line, {
				x: margin,
				y,
				size: titleSize,
				font: boldFont,
				color: rgb(0, 0, 0),
			});
			y -= titleSize + 8; // Adjusted line height for title
		}

		// Add quiz metadata
		const metadata = [
			`Subject: ${quiz.subject || "General"}`,
			`Topic: ${quiz.topic || "General"}`,
			`Number of Questions: ${
				quiz.num_questions || 0
			}`,
		];

		for (const line of metadata) {
			if (y < margin + 100) {
				({ page, y } = addNewPage());
			}

			page.drawText(line, {
				x: margin,
				y,
				size: subtitleSize,
				font: font,
				color: rgb(0.3, 0.3, 0.3),
			});
			y -= subtitleSize + 8;
		}

		y -= 20; // Add extra space before questions

		// Add questions
		for (const [
			index,
			question,
		] of questions.entries()) {
			if (y < margin + 100) {
				({ page, y } = addNewPage());
			}

			// Add question number and text
			const questionText = `${index + 1}. ${
				question.question_text
			}`;
			const questionLines = wrapText(
				questionText,
				495.28,
				boldFont,
				questionSize
			);

			for (const line of questionLines) {
				page.drawText(line, {
					x: margin,
					y,
					size: questionSize,
					font: boldFont,
					color: rgb(0, 0, 0),
				});
				y -= lineHeight;
			}

			// Add options
			for (const [key, value] of Object.entries(
				question.options
			)) {
				const optionText = `${key.toUpperCase()}. ${value}`;
				const optionLines = wrapText(
					optionText,
					495.28 - optionIndent,
					font,
					optionSize
				);

				for (const line of optionLines) {
					page.drawText(line, {
						x: margin + optionIndent,
						y,
						size: optionSize,
						font: font,
						color: rgb(0, 0, 0),
						maxWidth: 495.28 - optionIndent,
					});
					y -= lineHeight;
				}
			}

			y -= 20; // Add space between questions
		}

		// Add Answer Key Page
		({ page, y } = addNewPage());

		// Add Answer Key title
		page.drawText("Answer Key", {
			x: margin,
			y,
			size: titleSize,
			font: boldFont,
			color: rgb(0, 0, 0),
		});
		y -= titleSize + 20;

		// Add answer key content
		for (const [
			index,
			question,
		] of questions.entries()) {
			if (y < margin + 100) {
				({ page, y } = addNewPage());
				y -= 20; // Add space after page break
			}

			// Add question number and correct answer
			const answerText = `${
				index + 1
			}. ${question.correct_option.toUpperCase()}`;
			const answerLines = wrapText(
				answerText,
				495.28,
				boldFont,
				questionSize
			);

			for (const line of answerLines) {
				page.drawText(line, {
					x: margin,
					y,
					size: questionSize,
					font: boldFont,
					color: rgb(0, 0, 0),
				});
				y -= lineHeight;
			}

		}

		// Serialize the PDF
		const pdfBytes = await pdfDoc.save();

		return new NextResponse(pdfBytes, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("PDF generation failed:", error);
		return NextResponse.json(
			{ error: "Failed to generate PDF" },
			{ status: 500 }
		);
	}
}

// Helper function to wrap text
function wrapText(
	text: string,
	maxWidth: number,
	font: PDFFont,
	fontSize: number
): string[] {
	const words = text.split(" ");
	const lines: string[] = [];
	let currentLine = words[0];

	for (let i = 1; i < words.length; i++) {
		const word = words[i];
		const width = font.widthOfTextAtSize(
			currentLine + " " + word,
			fontSize
		);
		if (width < maxWidth) {
			currentLine += " " + word;
		} else {
			lines.push(currentLine);
			currentLine = word;
		}
	}
	lines.push(currentLine);
	return lines;
}
