import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const { type, user_id } = await req.json();
		let query = supabase
			.from("quizzes")
			.select("*")
			.order("created_at", { ascending: false });

		if (type === "public") {
			query = query.eq("is_public", true);
		} else if (type === "currentUser") {
			if (!user_id)
				return NextResponse.json(
					{ error: "User ID required" },
					{ status: 400 }
				);
			query = query.eq("creator_id", user_id);
		} else if (type === "specificUser") {
			if (!user_id)
				return NextResponse.json(
					{ error: "User ID required" },
					{ status: 400 }
				);
			query = query.eq("creator_id", user_id);
		} else {
			return NextResponse.json(
				{ error: "Invalid type" },
				{ status: 400 }
			);
		}

		const { data, error } = await query;
		if (error) throw error;

		return NextResponse.json({ quizzes: data });
	} catch (error) {
		return NextResponse.json(
			{ error: error.message },
			{ status: 500 }
		);
	}
}
