// Path: app/api/predictor/verify/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PredictorVerifySchema } from "@/lib/predictor/validations";
import { TUTOR_ERRORS } from "@/lib/constants/tutor";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = PredictorVerifySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input.", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { phone, otp } = parsed.data;
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const { data: session, error } = await supabase
    .from("predictor_sessions")
    .select("*")
    .eq("phone", phone)
    .eq("otp_hash", otpHash)
    .gt("otp_expires_at", new Date().toISOString())
    .is("verified_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !session) {
    return Response.json({ error: "Invalid or expired OTP." }, { status: 401 });
  }

  // Mark as verified
  await supabase
    .from("predictor_sessions")
    .update({ verified_at: new Date().toISOString() })
    .eq("id", session.id);

  // Create or get exam_profile for this user
  // For predictor, we create a temporary profile linked to the phone
  // In production, this would link to an authenticated user
  let userId = session.user_id;
  let examProfileId = session.exam_profile_id;

  if (!userId || !examProfileId) {
    // Check if there's an existing user with this phone
    const { data: existingProfile } = await supabase
      .from("exam_profiles")
      .select("profile_id, user_id")
      .eq("phone", phone)
      .eq("exam_name", session.exam_name)
      .single();

    if (existingProfile) {
      userId = existingProfile.user_id;
      examProfileId = existingProfile.profile_id;
    } else {
      // Create anonymous user profile (in production, use auth)
      // For now, create a placeholder - the predictor works without full auth
      const anonUserId = `anon_${phone.replace("+91", "")}_${Date.now()}`;
      userId = anonUserId;
    }
  }

  if (!examProfileId) {
    // Create exam profile
    const { data: newProfile } = await supabase
      .from("exam_profiles")
      .insert({
        user_id: userId,
        exam_name: session.exam_name,
        target_date: session.target_date,
        phone: phone,
        is_active: true,
        time_mode: "foundation",
      })
      .select("profile_id")
      .single();

    if (newProfile) {
      examProfileId = newProfile.profile_id;
    }
  }

  // Update session with user/profile links
  await supabase
    .from("predictor_sessions")
    .update({ user_id: userId, exam_profile_id: examProfileId })
    .eq("id", session.id);

  return Response.json({
    session_id: session.id,
    user_id: userId,
    exam_profile_id: examProfileId,
    message: "OTP verified. Redirecting to prediction...",
  });
}