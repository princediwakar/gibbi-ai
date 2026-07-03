// Path: app/api/comeback/retry/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { recordRetryResult } from "@/lib/comeback-queue";

const RetrySchema = z.object({
  queueItemId: z.string().uuid(),
  passed: z.boolean(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = RetrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await recordRetryResult(supabase, parsed.data.queueItemId, parsed.data.passed);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[ComebackRetry] Error:", err);
    return NextResponse.json(
      { error: "Failed to record retry result" },
      { status: 500 },
    );
  }
}
