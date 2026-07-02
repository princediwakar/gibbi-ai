import { ThemeProvider } from "@/components/ThemeProvider"
// import { ClarityProvider } from '@/components/ClarityProvider';

import { AppShell } from "@/components/AppShell";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner"
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/utils";
import { Metadata, Viewport } from "next";
import StructuredData, { websiteSchema, organizationSchema } from "@/components/seo/StructuredData";
import "./globals.css";
import "katex/dist/katex.min.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gibbi.vercel.app";

export const metadata: Metadata = {
    title: {
        default: "GibbiAI - Test Your Knowledge",
        template: "%s - Gibbi AI",
    },
    description: "Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
    keywords: ["quiz", "trivia", "knowledge test", "education", "learning"],
    openGraph: {
        title: "GibbiAI - Test Your Knowledge",
        description: "Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
        url: baseUrl,
        siteName: "GibbiAI",
        images: [{ url: `${baseUrl}/api/og?type=home`, width: 1200, height: 630 }],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "GibbiAI - Test Your Knowledge",
        description: "Create, share, and take quizzes on any topic. Join GibbiAI to challenge yourself and others!",
        images: [`${baseUrl}/api/og?type=home`],
    },
    icons: { icon: "/icon.ico" },
    metadataBase: new URL(baseUrl),
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export interface SidebarData {
  examName: string;
  daysRemaining: number;
  streak: number;
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let sidebarData: SidebarData | null = null;

    if (user) {
        const [profileRes, answersRes] = await Promise.all([
            supabase
                .from("exam_profiles")
                .select("exam_name, target_date")
                .eq("user_id", user.id)
                .eq("is_active", true)
                .maybeSingle(),
            supabase
                .from("session_answers")
                .select("answered_at")
                .eq("user_id", user.id)
                .order("answered_at", { ascending: false })
                .limit(500),
        ]);

        if (profileRes.data) {
            const now = new Date();
            const targetDate = new Date(profileRes.data.target_date);
            const daysRemaining = Math.max(
                0,
                Math.ceil((targetDate.getTime() - now.getTime()) / 86400000),
            );
            const streak = computeStreak(
                (answersRes.data || []) as { answered_at: string }[],
            );

            sidebarData = {
                examName: profileRes.data.exam_name,
                daysRemaining,
                streak,
            };
        }
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <StructuredData schema={websiteSchema} />
                    <StructuredData schema={organizationSchema} />
                    <AppShell sidebarData={sidebarData}>
                        {children}
                        <FeedbackWidget />
                        <Toaster position="top-center" richColors />
                    </AppShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
