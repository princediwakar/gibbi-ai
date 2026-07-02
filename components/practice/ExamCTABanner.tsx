// Path: components/practice/ExamCTABanner.tsx

import Link from "next/link";
import { getDaysUntilExam, getExamDateDisplay } from "@/lib/constants/practice";

interface ExamCTABannerProps {
  examName: string;
}

export default function ExamCTABanner({ examName }: ExamCTABannerProps) {
  const daysRemaining = getDaysUntilExam(examName);
  const dateDisplay = getExamDateDisplay(examName);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-8 text-white shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {daysRemaining !== null && daysRemaining > 0 ? (
          <>
            <p className="mb-2 text-lg font-semibold text-indigo-100">
              You have{" "}
              <span className="text-3xl font-extrabold text-white">
                {daysRemaining}
              </span>{" "}
              days until {examName}
            </p>
            {dateDisplay && (
              <p className="mb-6 text-sm text-indigo-200">
                Exam date: {dateDisplay}
              </p>
            )}
          </>
        ) : (
          <p className="mb-6 text-lg font-semibold text-indigo-100">
            Ready to prepare for {examName}?
          </p>
        )}

        <Link
          href="/setup"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-indigo-700 shadow-md transition-all hover:bg-indigo-50 hover:shadow-lg active:scale-[0.97]"
        >
          Start Your Free Assessment
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>

        <p className="mt-4 text-sm text-indigo-200">
          AI-powered practice with spaced repetition
        </p>
      </div>
    </div>
  );
}
