// Path: app/session/[session_id]/page.tsx

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionPlayer } from "@/components/tutor/SessionPlayer";
import { TUTOR_ERRORS } from "@/lib/constants/tutor";
import type { SessionQuestion } from "@/types/tutor";
import taxonomy from "@/lib/taxonomies.json";

interface SessionRow {
  id: string;
  user_id: string;
  exam_profile_id: string;
  questions_json: SessionQuestion[];
  status: string;
  created_at: string;
}

interface PageProps {
  params: Promise<{ session_id: string }>;
}

export default async function SessionPage({ params }: PageProps) {
  const { session_id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center mt-20">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-muted-foreground">{TUTOR_ERRORS.UNAUTHORIZED}</p>
      </div>
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, user_id, exam_profile_id, questions_json, status, created_at")
    .eq("id", session_id)
    .single();

  if (sessionError || !session) {
    notFound();
  }

  const sessionData = session as unknown as SessionRow;

  if (sessionData.user_id !== user.id) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center mt-20">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">{TUTOR_ERRORS.UNAUTHORIZED}</p>
      </div>
    );
  }

  if (sessionData.status === "completed") {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center mt-20">
        <h1 className="text-2xl font-bold mb-4">Session Completed</h1>
        <p className="text-muted-foreground">{TUTOR_ERRORS.SESSION_ALREADY_COMPLETED}</p>
      </div>
    );
  }

  const questions = sessionData.questions_json;

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center mt-20">
        <h1 className="text-2xl font-bold mb-4">No Questions Found</h1>
        <p className="text-muted-foreground">{TUTOR_ERRORS.QUESTION_NOT_FOUND}</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("exam_profiles")
    .select("exam_name")
    .eq("id", sessionData.exam_profile_id)
    .single();

  let taxonomyDomains: string[] = [];
  let initialMastery: Record<string, number> = {};

  if (profile) {
    const examTaxonomy = taxonomy as unknown as Record<string, Record<string, string[]>>;
    const examSubjects = examTaxonomy[profile.exam_name];
    if (examSubjects) {
      taxonomyDomains = [...new Set(Object.values(examSubjects).flat())];
    }
    
    const { data: concepts } = await supabase
      .from("concept_mastery")
      .select("skill_domain, mastery_score")
      .eq("user_id", user.id);
      
    if (concepts) {
      for (const c of concepts) {
        initialMastery[c.skill_domain] = c.mastery_score;
      }
    }
  }

  return (
    <SessionPlayer
      sessionId={sessionData.id}
      questions={questions}
      examProfileId={sessionData.exam_profile_id}
      taxonomyDomains={taxonomyDomains}
      initialMastery={initialMastery}
    />
  );
}
