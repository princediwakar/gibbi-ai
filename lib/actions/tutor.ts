// Path: lib/actions/tutor.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { ExamProfileSchema, type ExamProfileInput } from "@/lib/validations/tutor";
import { getTimeMode } from "@/lib/sm2";
import { TUTOR_CONFIG } from "@/lib/constants/tutor";
import { revalidatePath } from "next/cache";
import taxonomy from "@/lib/taxonomies.json";

type TaxonomyData = Record<string, Record<string, string[]>>;
const taxonomyData = taxonomy as unknown as TaxonomyData;

export async function createExamProfile(
  input: ExamProfileInput
): Promise<{ profile_id: string } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sign in to create your exam profile." };
  }

  const parsed = ExamProfileSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0] ?? "Invalid input.";
    return { error: firstError };
  }

  const { exam_name, target_date, self_assessments } = parsed.data;

  const daysRemaining = Math.ceil(
    (new Date(target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const time_mode = getTimeMode(daysRemaining);

  const { data: existingProfile } = await supabase
    .from("exam_profiles")
    .select("profile_id")
    .eq("user_id", user.id)
    .eq("exam_name", exam_name)
    .eq("is_active", true)
    .maybeSingle();

  let profileId: string;

  if (existingProfile) {
    profileId = existingProfile.profile_id;
    const { error: updateError } = await supabase
      .from("exam_profiles")
      .update({ target_date, time_mode })
      .eq("profile_id", profileId);

    if (updateError) {
      console.error("[createExamProfile] Profile update error:", updateError);
      return { error: "Failed to update your exam profile. Please try again." };
    }
  } else {
    const { data: profile, error: profileError } = await supabase
      .from("exam_profiles")
      .insert({
        user_id: user.id,
        exam_name,
        target_date,
        time_mode,
        is_active: true,
      })
      .select("profile_id")
      .single();

    if (profileError || !profile) {
      console.error("[createExamProfile] Profile insert error:", profileError);
      return { error: "Failed to create your exam profile. Please try again." };
    }

    profileId = profile.profile_id;
  }

  const now = new Date().toISOString();
  const masteryMap = new Map<string, number>();
  const examSubjects = taxonomyData[exam_name] ?? {};

  for (const [subject, assessment] of Object.entries(self_assessments)) {
    const domains = examSubjects[subject] ?? [subject];
    const prior = TUTOR_CONFIG.MASTERY_PRIORS[assessment];
    for (const domain of domains) {
      const existing = masteryMap.get(domain);
      if (existing === undefined || prior < existing) {
        masteryMap.set(domain, prior);
      }
    }
  }

  const masteryRows = [...masteryMap.entries()].map(([domain, prior]) => ({
    user_id: user.id,
    exam_profile_id: profileId,
    skill_domain: domain,
    mastery_score: prior,
    total_attempted: 0,
    total_correct: 0,
    review_interval_days: TUTOR_CONFIG.SM2_DEFAULTS.initial_interval_days,
    review_ease_factor: TUTOR_CONFIG.SM2_DEFAULTS.initial_ease_factor,
    next_review_at: now,
    last_seen_at: now,
  }));

  const { error: masteryError } = await supabase
    .from("concept_mastery")
    .upsert(masteryRows, {
      onConflict: "user_id, exam_profile_id, skill_domain",
    });

  if (masteryError) {
    console.error("[createExamProfile] Mastery upsert error:", masteryError);
    return { error: "Failed to save your self-assessments. Please try again." };
  }

  revalidatePath("/dashboard");

  return { profile_id: profileId };
}
