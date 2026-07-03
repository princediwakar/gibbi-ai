// Path: app/api/predictor/result/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePrediction } from "@/lib/predictor/engine";
import { TUTOR_ERRORS } from "@/lib/constants/tutor";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const userId = searchParams.get("user_id");
  const examProfileId = searchParams.get("exam_profile_id");

  // Support both session-based and direct user/profile lookup
  let targetUserId = userId;
  let targetProfileId = examProfileId;

  if (sessionId) {
    const { data: session } = await supabase
      .from("predictor_sessions")
      .select("user_id, exam_profile_id")
      .eq("id", sessionId)
      .eq("verified_at", "not null") // Only verified sessions
      .single();

    if (!session) {
      return Response.json({ error: "Invalid or unverified session." }, { status: 401 });
    }

    targetUserId = session.user_id;
    targetProfileId = session.exam_profile_id;
  }

  if (!targetUserId || !targetProfileId) {
    return Response.json({ error: "Missing user or profile ID." }, { status: 400 });
  }

  try {
    const prediction = await generatePrediction(targetUserId, targetProfileId);

    // Store prediction snapshot
    const { data: savedPrediction } = await supabase
      .from("predictions")
      .upsert({
        user_id: targetUserId,
        exam_profile_id: targetProfileId,
        predicted_percentile: prediction.overallPercentile,
        band_lower: prediction.overallBandLower,
        band_upper: prediction.overallBandUpper,
        sessions_used: prediction.totalTrackedSessions,
        calibration_source: prediction.calibrationSource,
        subject_breakdown: prediction.subjects,
        is_frozen: prediction.isFrozen,
        frozen_at: prediction.frozenAt,
      })
      .select("id")
      .single();

    return Response.json({
      ...prediction,
      prediction_id: savedPrediction?.id,
    });
  } catch (error) {
    console.error("[Predictor Result] Error:", error);
    return Response.json(
      { error: TUTOR_ERRORS.AI_GENERATION_FAILED, details: (error as Error).message },
      { status: 500 }
    );
  }
}