// Path: app/create/page.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuizDashboard } from "@/components/QuizDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Quiz | GibbiAI",
  description:
    "Paste your notes or upload a PDF. Get practice tests in seconds. No card-making, no setup—just study what you don't know.",
};

export default function CreatePage() {
  return (
    <Suspense>
      <CreatePageContent />
    </Suspense>
  );
}

async function CreatePageContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <QuizDashboard />;
}
