import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

const MAX_PENDING_TIME = 300000;

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Quiz ID is required" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("quizzes")
			.select("*, questions(*)")
			.eq("quiz_id", id)
			.single();

		if (error) throw error;

		// If the quiz status is failed, remove it from the database
		if (data.status === "failed") {
			await supabase
				.from("quizzes")
				.delete()
				.eq("quiz_id", id);

			return NextResponse.json({
				status: "failed",
				error: "Quiz generation failed and has been removed",
			});
		}
		// Check if quiz has been pending too long
		if (data.status === "pending") {
			const createdTime = new Date(data.created_at).getTime();
			const currentTime = Date.now();

			if (currentTime - createdTime > MAX_PENDING_TIME) {
				// Mark as failed if pending too long
				await supabase
					.from("quizzes")
					.delete()
					.eq("quiz_id", id);

				return NextResponse.json({
					status: "failed",
					error: "Quiz generation timed out and has been removed",
				});
			}
		}



		return NextResponse.json({
			status: data.status,
			quiz: data,
		});
	} catch (error) {
		console.error("Status check error:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Internal Server Error",
			},
			{ status: 500 }
		);
	}
}