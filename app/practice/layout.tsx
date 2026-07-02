// Path: app/practice/layout.tsx

import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gibbi.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Practice Questions | GibbiAI",
    template: "%s | GibbiAI",
  },
  description:
    "Free exam practice questions with AI-generated explanations and distractor analysis. Prepare for JEE, NEET, UPSC, GMAT, SAT, GRE, CAT, GATE, CLAT, and CA Foundation.",
  keywords: [
    "practice questions",
    "exam preparation",
    "free test prep",
    "AI-generated questions",
    "JEE practice",
    "NEET practice",
    "UPSC practice",
    "GMAT practice",
    "SAT practice",
    "GRE practice",
  ],
  openGraph: {
    title: "Practice Questions | GibbiAI",
    description:
      "Free exam practice questions with AI-generated explanations and distractor analysis.",
    url: `${baseUrl}/practice`,
    siteName: "GibbiAI",
    images: [{ url: `${baseUrl}/api/og?type=practice&title=Practice%20Questions&topic=GibbiAI`, width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
