// Path: app/insights/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Brain } from "lucide-react";
import { getInsightsExams } from "@/lib/insights-queries";

export const metadata: Metadata = {
  title: "Free Exam Insights & Statistics | GibbiAI",
  description:
    "Data-driven exam prep insights. Discover the most failed concepts and hardest topics across major exams like JEE Main, NEET, UPSC, and more — powered by real practice data.",
};

export default async function InsightsPage() {
  let exams: string[] = [];
  let fetchError = false;

  try {
    exams = await getInsightsExams();
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Failed to load insights
          </h1>
          <p className="text-sm text-slate-400 max-w-sm">
            Something went wrong fetching exam data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Not enough data yet
          </h1>
          <p className="text-sm text-slate-400">
            As more students practice, insights will appear here. Start a
            practice session to contribute.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Exam Insights & Statistics
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Discover which topics students find most challenging across major
            exams. Data is aggregated from real practice sessions on GibbiAI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div
              key={exam}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 p-6 shadow-lg"
            >
              <h2 className="text-lg font-bold text-white mb-1">{exam}</h2>
              <p className="text-xs text-slate-500 mb-5">
                Aggregated practice data
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/insights/${encodeURIComponent(exam)}/most-failed-concepts`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Most Failed Concepts
                </Link>
                <Link
                  href={`/insights/${encodeURIComponent(exam)}/hardest-topics`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  Hardest Topics
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-600 text-center mt-10">
          Data refreshes as more students practice on GibbiAI. Only domains with
          at least 10 attempts are included.
        </p>
      </div>
    </div>
  );
}
