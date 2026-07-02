// Path: app/insights/[exam]/most-failed-concepts/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WithContext } from "schema-dts";
import {
  getMostFailedConcepts,
  getTotalPracticeSessions,
  getDomainSubject,
  type FailedConcept,
} from "@/lib/insights-queries";
import StructuredData, {
  breadcrumbSchema,
} from "@/components/seo/StructuredData";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ exam: string }>;
}

async function getData(examRaw: string): Promise<{
  concepts: FailedConcept[] | null;
  totalSessions: number;
  fetchError: boolean;
}> {
  const exam = decodeURIComponent(examRaw);
  try {
    const [concepts, totalSessions] = await Promise.all([
      getMostFailedConcepts(exam),
      getTotalPracticeSessions(exam),
    ]);
    return { concepts, totalSessions, fetchError: false };
  } catch {
    return { concepts: null, totalSessions: 0, fetchError: true };
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { exam } = await params;
  const examName = decodeURIComponent(exam);
  const { concepts } = await getData(examName);

  if (!concepts || concepts.length === 0) {
    return {
      title: `${examName} Most Failed Concepts`,
      description: `Not enough data yet for ${examName}. More students need to practice.`,
    };
  }

  const top3 = concepts.slice(0, 3).map((c) => c.skill_domain).join(", ");
  return {
    title: `${examName} Most Failed Concepts`,
    description: `Top failed concepts for ${examName}: ${top3}. Based on real practice data from GibbiAI students.`,
  };
}

export default async function MostFailedConceptsPage({ params }: PageProps) {
  const { exam } = await params;
  const examName = decodeURIComponent(exam);
  const { concepts, totalSessions, fetchError } = await getData(examName);

  if (fetchError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Failed to load data
          </h1>
          <p className="text-sm text-slate-400 max-w-sm">
            Something went wrong. Please try again later.
          </p>
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Insights
          </Link>
        </div>
      </div>
    );
  }

  if (!concepts || concepts.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Not enough data yet
          </h1>
          <p className="text-sm text-slate-400">
            Not enough data yet for <span className="font-medium text-slate-300">{examName}</span>. More students need to practice before
            concept failure rates can be reliably calculated.
          </p>
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Insights
          </Link>
        </div>
      </div>
    );
  }

  const uniqueDomains = new Set(concepts.map((c) => c.skill_domain)).size;

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${examName} Most Failed Concepts — GibbiAI`,
    description: `Ranked list of concept domains by student failure rate for ${examName} exam preparation, based on real practice data.`,
    creator: { "@type": "Organization", name: "GibbiAI" },
  } as const;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gibbi.vercel.app";

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:py-12">
      <StructuredData schema={datasetSchema as WithContext<any>} />
      <StructuredData
        schema={
          breadcrumbSchema([
            { name: "Home", url: baseUrl },
            { name: "Insights", url: `${baseUrl}/insights` },
            {
              name: `${examName} Most Failed Concepts`,
              url: `${baseUrl}/insights/${encodeURIComponent(examName)}/most-failed-concepts`,
            },
          ]) as WithContext<any>
        }
      />

      <div className="max-w-4xl mx-auto">
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Insights
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {examName} — Most Failed Concepts
          </h1>
          <p className="text-sm text-slate-400">
            Based on{" "}
            <span className="font-semibold text-slate-300">
              {totalSessions.toLocaleString()}
            </span>{" "}
            real practice sessions across{" "}
            <span className="font-semibold text-slate-300">
              {uniqueDomains}
            </span>{" "}
            domains. Only domains with at least 10 attempts are shown.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Failure Rate
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Attempts
                  </th>
                </tr>
              </thead>
              <tbody>
                {concepts.map((concept, index) => {
                  const subject = getDomainSubject(examName, concept.skill_domain);
                  const practiceHref = subject
                    ? `/practice/${encodeURIComponent(examName)}/${encodeURIComponent(subject)}/${encodeURIComponent(concept.skill_domain)}`
                    : "#";

                  return (
                    <tr
                      key={concept.skill_domain}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                        #{index + 1}
                      </td>
                      <td className="py-3 px-4">
                        {subject ? (
                          <Link
                            href={practiceHref}
                            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            {concept.skill_domain}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-slate-300">
                            {concept.skill_domain}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px] h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all"
                              style={{ width: `${Math.min(concept.failure_rate, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-rose-400 tabular-nums w-12 text-right">
                            {concept.failure_rate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-slate-400 tabular-nums">
                        {concept.total_attempts.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-600 text-center mt-8">
          Data refreshes as more students practice on GibbiAI. Minimum threshold:
          10 attempts per domain.
        </p>
      </div>
    </div>
  );
}
