// Path: app/api/admin/calibration/result/route.ts
// Opt-in: capture a user's actual percentile post-results
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { captureActualResult } from "@/lib/calibration";

const ResultSchema = z.object({
  userId: z.string().min(1),
  predictionId: z.string().uuid(),
  examName: z.string().min(1),
  sessionLabel: z.string().min(1),
  actualPercentile: z.number().min(0).max(100),
  actualMarks: z.number().optional(),
  subjectBreakdown: z.record(z.string(), z.number()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ResultSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const predictionId = await captureActualResult(supabaseAdmin, parsed.data);

    return NextResponse.json({ predictionId, captured: true });
  } catch (err) {
    console.error("[CalibrationResult] Error:", err);
    return NextResponse.json(
      { error: "Failed to capture result" },
      { status: 500 },
    );
  }
}
