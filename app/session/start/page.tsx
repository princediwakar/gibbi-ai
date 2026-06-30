// Path: app/session/start/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TUTOR_ROUTES } from "@/lib/constants/tutor";
import { SessionAutoStarter } from "@/components/tutor/SessionAutoStarter";
import type { ExamProfile } from "@/types/tutor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice | GibbiAI",
  description: "Starting your personalized AI-powered practice session",
};

export default async function SessionStartPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const [profileRes, activeSessionRes] = await Promise.all([
    supabase
      .from("exam_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single(),
    supabase
      .from("sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (profileRes.error || !profileRes.data) {
    redirect(TUTOR_ROUTES.SETUP);
  }

  const profile = profileRes.data as ExamProfile;
  const activeSessions = activeSessionRes.data || [];
  const hasActiveSession = activeSessions.length > 0;

  if (hasActiveSession) {
    redirect(TUTOR_ROUTES.SESSION(activeSessions[0].id));
  }

  const now = new Date();
  const targetDate = new Date(profile.target_date);
  const daysRemaining = Math.max(
    0,
    Math.ceil((targetDate.getTime() - now.getTime()) / 86400000)
  );

  return (
    <SessionAutoStarter
      profileId={profile.profile_id}
      examName={profile.exam_name}
      daysRemaining={daysRemaining}
    />
  );
}
