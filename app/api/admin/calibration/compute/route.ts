// Path: app/api/admin/calibration/compute/route.ts
// Admin-only: computes VIA and publishes calibration report (trigger post-results)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { publishCalibrationReport } from "@/lib/calibration";

const ComputeSchema = z.object({
  snapshotId: z.string().uuid(),
  adminKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ComputeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (parsed.data.adminKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const report = await publishCalibrationReport(supabaseAdmin, parsed.data.snapshotId);

    return NextResponse.json(report);
  } catch (err) {
    console.error("[CalibrationCompute] Error:", err);
    return NextResponse.json(
      { error: "VIA computation failed" },
      { status: 500 },
    );
  }
}
