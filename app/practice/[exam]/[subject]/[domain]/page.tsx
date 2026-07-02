// Path: app/practice/[exam]/[subject]/[domain]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import PracticeQuestion from "@/components/practice/PracticeQuestion";
import ExamCTABanner from "@/components/practice/ExamCTABanner";
import StructuredData, { breadcrumbSchema } from "@/components/seo/StructuredData";
import Link from "next/link";
import type { Question } from "@/lib/schemas/quiz";
import type { WithContext } from "schema-dts";

// ---- Types ----

interface PracticePageProps {
  params: Promise<{ exam: string; subject: string; domain: string }>;
}

interface PracticeRow {
  questions_json: Question[];
}

// ---- Helpers ----

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gibbi.vercel.app";

// ---- generateMetadata ----

export async function generateMetadata({ params }: PracticePageProps): Promise<Metadata> {
  const { exam, subject, domain } = await params;
  const decodedExam = decodeURIComponent(exam);
  const decodedDomain = decodeURIComponent(domain);
  const decodedSubject = decodeURIComponent(subject);

  const title = `${decodedDomain} Practice Questions for ${decodedExam} | GibbiAI`;
  const description = `Free ${decodedDomain} practice questions for ${decodedExam} ${decodedSubject}. AI-generated questions with detailed explanations and distractor analysis. Test your knowledge now.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `${baseUrl}/api/og?type=practice&title=${encodeURIComponent(decodedDomain)}&topic=${encodeURIComponent(decodedExam)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    keywords: [
      decodedDomain,
      decodedSubject,
      decodedExam,
      "practice questions",
      "free test prep",
      "AI-generated questions",
      `${decodedExam} preparation`,
    ],
  };
}

// ---- Page Component ----

export default async function PracticePage({ params }: PracticePageProps) {
  const { exam, subject, domain } = await params;
  const decodedExam = decodeURIComponent(exam);
  const decodedSubject = decodeURIComponent(subject);
  const decodedDomain = decodeURIComponent(domain);

  let row: PracticeRow | null = null;
  let fetchError: string | null = null;

  try {
    const { data, error } = await supabaseAdmin
      .from("practice_questions")
      .select("questions_json")
      .eq("exam_name", decodedExam)
      .eq("subject", decodedSubject)
      .eq("domain", decodedDomain)
      .single();

    if (error) {
      fetchError = error.message;
    } else if (data) {
      row = data as unknown as PracticeRow;
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load practice questions";
  }

  // Error state: DB-level error
  if (fetchError && !row) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900/30 dark:bg-red-950/10">
          <h2 className="mb-2 text-xl font-semibold text-red-700 dark:text-red-400">
            Something went wrong
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300">
            We could not load practice questions for this topic. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Empty state: no data found
  if (!row) {
    notFound();
  }

  const questions: Question[] = Array.isArray(row.questions_json) ? row.questions_json : [];
  if (questions.length === 0) {
    notFound();
  }

  // Build breadcrumb items
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Practice", url: `${baseUrl}/practice` },
    { name: decodedExam, url: `${baseUrl}/practice/${encodeURIComponent(decodedExam)}` },
    { name: decodedSubject, url: `${baseUrl}/practice/${encodeURIComponent(decodedExam)}/${encodeURIComponent(decodedSubject)}` },
    { name: decodedDomain, url: `${baseUrl}/practice/${encodeURIComponent(decodedExam)}/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(decodedDomain)}` },
  ];

  // Build structured data schemas
  const quizSchema: WithContext<any> = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `${decodedDomain} Practice Questions - ${decodedExam}`,
    description: `Free ${decodedDomain} practice questions for ${decodedExam} ${decodedSubject}. AI-generated with detailed explanations.`,
    educationalLevel: decodedExam,
    about: { "@type": "Thing", name: decodedDomain },
    hasPart: questions.map((q) => ({
      "@type": "Question",
      name: q.question_text.length > 110 ? q.question_text.slice(0, 107) + "..." : q.question_text,
      suggestedAnswer: Object.entries(q.options).map(([label, text]) => ({
        "@type": "Answer",
        text: `${label}) ${text}`,
      })),
      acceptedAnswer: {
        "@type": "Answer",
        text: `${q.correct_option}) ${q.options[q.correct_option] ?? ""}`,
      },
    })),
  } as WithContext<any>;

  return (
    <>
      <StructuredData schema={breadcrumbSchema(breadcrumbItems) as WithContext<any>} />
      <StructuredData schema={quizSchema} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Home
              </Link>
            </li>
            <li className="select-none">/</li>
            <li>
              <Link href="/practice" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Practice
              </Link>
            </li>
            <li className="select-none">/</li>
            <li>
              <Link
                href={`/practice/${encodeURIComponent(decodedExam)}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {decodedExam}
              </Link>
            </li>
            <li className="select-none">/</li>
            <li>
              <Link
                href={`/practice/${encodeURIComponent(decodedExam)}/${encodeURIComponent(decodedSubject)}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {decodedSubject}
              </Link>
            </li>
            <li className="select-none">/</li>
            <li className="font-medium text-indigo-600 dark:text-indigo-400">
              {decodedDomain}
            </li>
          </ol>
        </nav>

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {decodedDomain} Practice Questions
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            Free {decodedDomain} practice questions for {decodedExam} ({decodedSubject}). AI-generated with detailed explanations and distractor analysis to help you master every concept.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <PracticeQuestion key={idx} question={q} index={idx} />
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-10">
          <ExamCTABanner examName={decodedExam} />
        </div>
      </div>
    </>
  );
}
