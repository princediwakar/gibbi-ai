// app/quizzes/metadata.ts
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const ogImageUrl = `${baseUrl}/api/og?type=home`;

export const metadata: Metadata = {
  title: "Public Quizzes", // Will become "Public Quizzes - QuizMasterAI" via template
  description:
    "Explore and take public quizzes on various topics. Test your knowledge and learn new things!",
  keywords: [
    "quizzes",
    "public quizzes",
    "knowledge test",
    "learning",
    "education",
  ],
  openGraph: {
    title: "Public Quizzes",
    description: "Explore and take public quizzes on various topics",
    url: `${baseUrl}/quizzes`,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "GibbiAI Public Quizzes",
      },
    ],
  },
  twitter: {
    title: "Public Quizzes",
    description: "Explore and take public quizzes on various topics",
    images: [ogImageUrl],
  },
};