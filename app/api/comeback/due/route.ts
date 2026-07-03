// Path: app/api/comeback/due/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDueComebacks, getComebackCounts } from "@/lib/comeback-queue";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [items, counts] = await Promise.all([
      getDueComebacks(supabase, user.id),
      getComebackCounts(supabase, user.id),
    ]);

    return NextResponse.json({ items, counts });
  } catch (err) {
    console.error("[ComebackDue] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch comeback items" },
      { status: 500 },
    );
  }
}
