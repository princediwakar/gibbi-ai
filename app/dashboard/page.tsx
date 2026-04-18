import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Dashboard | GibbiAI",
  description: "View your quiz performance, track progress, and discover areas to improve.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/");
  }
  
  return (
    <div className="w-full max-w-6xl py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and discover areas to improve
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}