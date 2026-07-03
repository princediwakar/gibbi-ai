// Path: app/api/admin/calibration/freeze/route.ts
// Admin-only: freezes all active predictions for an exam (trigger 7 days pre-exam)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { runCalibrationCycle } from "@/lib/calibration";

const FreezeSchema = z.object({
  examName: z.string().min(1),
  sessionLabel: z.string().min(1),
  examDate: z.string().min(1),
  adminKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = FreezeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Simple admin key check (use CRON_SECRET or similar in production)
    if (parsed.data.adminKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await runCalibrationCycle(supabaseAdmin, {
      examName: parsed.data.examName,
      sessionLabel: parsed.data.sessionLabel,
      examDate: parsed.data.examDate,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[CalibrationFreeze] Error:", err);
    return NextResponse.json(
      { error: "Calibration freeze failed" },
      { status: 500 },
    );
  }
}
