// Path: app/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudentsLanding from "@/app/landing/students/page";
import { metadata } from "./metadata";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => metadata;

export default async function IndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <StudentsLanding />;
  }

  const { data: profile } = await supabase
    .from("exam_profiles")
    .select("profile_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (profile) {
    redirect("/dashboard");
  }

  redirect("/create");
}
