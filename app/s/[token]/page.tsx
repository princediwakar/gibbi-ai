// Path: app/s/[token]/page.tsx

import { supabaseAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Award, Target } from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

interface MasteryDelta {
  domain: string;
  before: number;
  after: number;
}

interface CardData {
  exam_name?: string;
  score?: number;
  total_questions?: number;
  mastery_delta?: MasteryDelta[];
  topics?: string[];
  time_taken?: number;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://gibbi.vercel.app";

  try {
    const { data: card, error } = await supabaseAdmin
      .from("result_cards")
      .select("card_data")
      .eq("share_token", token)
      .single();

    if (error || !card) {
      return {
        title: "Card not found - GibbiAI",
        description: "This share link is invalid or has expired.",
      };
    }

    const cd = card.card_data as CardData;
    const examName = cd.exam_name || "Practice Session";
    const score = cd.score ?? 0;
    const total = cd.total_questions ?? 0;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const improvedCount =
      cd.mastery_delta?.filter((d) => d.after > d.before).length ?? 0;

    const ogImageUrl = `${baseUrl}/api/og?type=session&title=${encodeURIComponent(
      `${examName}: ${pct}%`
    )}&topic=${encodeURIComponent(`Score: ${score}/${total}`)}`;

    const description =
      improvedCount > 0
        ? `Improved in ${improvedCount} topics. Start your free prep on GibbiAI.`
        : `Scored ${score}/${total}. Start your free prep on GibbiAI.`;

    return {
      title: `${examName}: ${score}/${total} (${pct}%)`,
      description,
      openGraph: {
        title: `${examName}: ${pct}%`,
        description,
        url: `${baseUrl}/s/${token}`,
        images: [{ url: ogImageUrl, width: 1200, height: 630 }],
        type: "website",
        siteName: "GibbiAI",
      },
      twitter: {
        card: "summary_large_image",
        title: `${examName}: ${pct}%`,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: "Share Card - GibbiAI",
      description: "View practice session results on GibbiAI.",
    };
  }
}

function getScoreGradient(pct: number) {
  if (pct >= 80) return "from-emerald-500 to-emerald-400";
  if (pct >= 60) return "from-amber-500 to-amber-400";
  return "from-rose-500 to-rose-400";
}

function getScoreTextColor(pct: number) {
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 60) return "text-amber-400";
  return "text-rose-400";
}

function getScoreGlow(pct: number) {
  if (pct >= 80) return "shadow-emerald-500/25";
  if (pct >= 60) return "shadow-amber-500/25";
  return "shadow-rose-500/25";
}

function getScoreRing(pct: number) {
  if (pct >= 80) return "border-emerald-500/30 bg-emerald-500/5";
  if (pct >= 60) return "border-amber-500/30 bg-amber-500/5";
  return "border-rose-500/30 bg-rose-500/5";
}

export default async function ShareCardPage({ params }: PageProps) {
  const { token } = await params;

  let card;
  try {
    const result = await supabaseAdmin
      .from("result_cards")
      .select("*")
      .eq("share_token", token)
      .single();
    card = result.data;
    if (result.error || !card) notFound();
  } catch {
    notFound();
  }

  supabaseAdmin
    .from("result_cards")
    .update({ view_count: (card.view_count ?? 0) + 1 })
    .eq("id", card.id)
    .then(({ error }) => {
      if (error) console.error("Failed to increment view count:", error);
    });

  const cd = card.card_data as CardData;
  const examName = cd.exam_name || "Practice Session";
  const score = cd.score ?? 0;
  const total = cd.total_questions ?? 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const masteryDelta: MasteryDelta[] = cd.mastery_delta ?? [];
  const improvedTopics = masteryDelta.filter((d) => d.after > d.before);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 shadow-2xl">
          <div
            className={`h-1.5 w-full bg-gradient-to-r ${getScoreGradient(pct)}`}
          />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Practice Session
                </p>
                <h1 className="text-xl font-bold text-white">{examName}</h1>
              </div>
            </div>

            <div
              className={`rounded-xl border p-6 mb-8 ${getScoreRing(pct)} ${getScoreGlow(pct)} shadow-lg`}
            >
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">
                    Your Score
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-5xl font-bold tracking-tight ${getScoreTextColor(pct)}`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {score} / {total} correct
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${getScoreRing(pct)}`}
                >
                  <Target className={`w-7 h-7 ${getScoreTextColor(pct)}`} />
                </div>
              </div>
            </div>

            {improvedTopics.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Mastery Improvements
                  </h2>
                </div>
                <div className="space-y-3">
                  {improvedTopics.map((item) => {
                    const improvement = Math.round(
                      (item.after - item.before) * 100
                    );
                    const beforePct = Math.round(item.before * 100);
                    const afterPct = Math.round(item.after * 100);
                    return (
                      <div key={item.domain} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-slate-300">
                            {item.domain}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400">
                            +{improvement}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                              style={{ width: `${afterPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-20 text-right tabular-nums">
                            {beforePct}% &rarr; {afterPct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {masteryDelta.length > 0 && improvedTopics.length === 0 && (
              <div className="mb-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm text-slate-400 text-center">
                  Practice complete. Keep going to see mastery improvements.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/setup"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-base hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98]"
              >
                Start your free prep
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-slate-500 text-center">
                Master your exam topics with AI-powered practice on GibbiAI
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Powered by GibbiAI</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
