// Path: app/setup/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SetupForm } from "@/components/tutor/SetupForm";
import type { SetupFormPrefill } from "@/components/tutor/SetupForm";
import { SignInButton } from "@/components/SignInButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import type { SelfAssessment } from "@/types/tutor";
import taxonomy from "@/lib/taxonomies.json";

const TAXONOMY = taxonomy as unknown as Record<string, Record<string, string[]>>;

export const metadata: Metadata = {
  title: "Exam Profile Setup | GibbiAI",
  description: "Set up your personalized exam prep profile for AI-powered practice.",
};

export default function SetupPage() {
  return (
    <Suspense fallback={<SetupSkeleton />}>
      <SetupPageContent />
    </Suspense>
  );
}

function SetupSkeleton() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 py-16">
      <div className="w-full space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-5 w-72 mx-auto" />
        <Card>
          <CardContent className="space-y-5 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

async function SetupPageContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Welcome to GibbiAI</CardTitle>
            <CardDescription>
              Sign in to set up your personalized exam prep and start practicing.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <SignInButton buttonText="Sign in with Google" />
          </CardContent>
        </Card>
      </main>
    );
  }

  // Load existing active profile
  const { data: profile } = await supabase
    .from("exam_profiles")
    .select("profile_id, exam_name, target_date")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  let prefill: SetupFormPrefill | null = null;

  if (profile) {
    // Load existing self-assessments from concept_mastery
    const { data: masteryRows } = await supabase
      .from("concept_mastery")
      .select("skill_domain, mastery_score")
      .eq("user_id", user.id)
      .eq("exam_profile_id", profile.profile_id)
      .order("skill_domain");

    const subjects = TAXONOMY[profile.exam_name] ?? {};
    const assessments: Record<string, SelfAssessment> = {};

    if (masteryRows && masteryRows.length > 0) {
      for (const [subject, domains] of Object.entries(subjects)) {
        const domainScores = masteryRows.filter((r) => domains.includes(r.skill_domain));
        if (domainScores.length > 0) {
          const avgScore =
            domainScores.reduce((sum, r) => sum + (r.mastery_score ?? 0.25), 0) /
            domainScores.length;
          if (avgScore <= 0.4) assessments[subject] = "weak";
          else if (avgScore <= 0.65) assessments[subject] = "okay";
          else assessments[subject] = "strong";
        } else {
          assessments[subject] = "okay";
        }
      }
    } else {
      // No mastery rows yet — default all subjects to "okay"
      for (const subject of Object.keys(subjects)) {
        assessments[subject] = "okay";
      }
    }

    prefill = {
      exam: profile.exam_name,
      targetDate: profile.target_date,
      assessments,
      isExisting: true,
    };
  }

  return <SetupForm prefill={prefill} />;
}
