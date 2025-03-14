import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

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

		return NextResponse.json({
			status: data.status,
			quiz: data,
		});
	} catch (error) {
		console.error("Status check error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Internal Server Error",
			},
			{ status: 500 }
		);
	}
}
