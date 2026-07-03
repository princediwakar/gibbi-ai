// Path: app/api/predictor/start/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PredictorStartSchema } from "@/lib/predictor/validations";
import { TUTOR_ERRORS } from "@/lib/constants/tutor";
import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = PredictorStartSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input.", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { exam_name, target_date, phone } = parsed.data;

  // Check for existing unverified OTP session
  const { data: existingSession } = await supabase
    .from("predictor_sessions")
    .select("*")
    .eq("phone", phone)
    .eq("exam_name", exam_name)
    .is("verified_at", null)
    .gt("otp_expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingSession) {
    // Resend OTP (rate limited)
    if (existingSession.otp_attempts >= MAX_OTP_ATTEMPTS) {
      return Response.json(
        { error: "Too many OTP requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    const newOtp = crypto.randomInt(100000, 999999).toString();
    const newExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    await supabase
      .from("predictor_sessions")
      .update({
        otp_hash: crypto.createHash("sha256").update(newOtp).digest("hex"),
        otp_expires_at: newExpiry,
        otp_attempts: existingSession.otp_attempts + 1,
      })
      .eq("id", existingSession.id);

    // In production: send OTP via SMS provider (Twilio, AWS SNS, etc.)
    console.log(`[PREDICTOR OTP] Phone: ${phone} OTP: ${newOtp} (dev mode)`);

    return Response.json({
      session_id: existingSession.id,
      message: "OTP resent. Check your messages.",
    });
  }

  // Create new predictor session
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const { data: session, error } = await supabase
    .from("predictor_sessions")
    .insert({
      phone,
      exam_name,
      target_date,
      otp_hash: otpHash,
      otp_expires_at: otpExpiresAt,
      otp_attempts: 0,
    })
    .select("id")
    .single();

  if (error || !session) {
    console.error("[Predictor Start] Insert error:", error);
    return Response.json({ error: TUTOR_ERRORS.AI_GENERATION_FAILED }, { status: 500 });
  }

  // In production: send OTP via SMS
  console.log(`[PREDICTOR OTP] Phone: ${phone} OTP: ${otp} (dev mode)`);

  return Response.json({
    session_id: session.id,
    message: "OTP sent to your phone. Enter it to see your prediction.",
  });
}