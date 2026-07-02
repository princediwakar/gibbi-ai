// Path: components/tutor/DashboardView.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { DashboardPageData } from "@/app/dashboard/page";
import { TUTOR_ROUTES, TUTOR_CONFIG } from "@/lib/constants/tutor";
import { toast } from "sonner";
import {
  Zap,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Crosshair,
  Settings2,
  Loader2,
  CalendarDays,
  Flame,
  PlusCircle,
  MessagesSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function DomainBar({ domain, score }: { domain: string; score: number }) {
  const pct = Math.round(score * 100);

  const barColor =
    score < 0.4
      ? "bg-red-500"
      : score < 0.7
        ? "bg-yellow-500"
        : "bg-green-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium truncate max-w-[70%]">{domain}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

function getDirectiveText(data: DashboardPageData): {
  heading: string;
  subtext: string;
} {
  if (data.overdueDomainCount > 0 && data.weakestOverdueDomain) {
    const label =
      data.overdueDomainCount === 1 ? "domain" : "domains";
    return {
      heading: `${data.overdueDomainCount} ${label} overdue — ${data.weakestOverdueDomain} needs you most.`,
      subtext: "Spaced repetition targets your weakest overdue topics first.",
    };
  }
  if (data.activeTargets.length > 0) {
    const label = data.activeTargets.slice(0, 3).join(", ");
    const verb = data.activeTargets.length === 1 ? "is" : "are";
    return {
      heading: `Pinned: ${label} ${verb} ready when you are.`,
      subtext: "Start a session focused on your active targets.",
    };
  }
  return {
    heading: "Stay sharp — keep your review streak alive.",
    subtext:
      "Consistent spaced repetition is the most effective path to mastery.",
  };
}

export function DashboardViewLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="flex gap-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  );
}

export function DashboardViewError({ message }: { message: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
      <p className="text-destructive font-medium">{message}</p>
      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );
}

export function DashboardView({ data }: { data: DashboardPageData }) {
  const router = useRouter();

  const [algoReviewLoading, setAlgoReviewLoading] = useState(false);
  const [activeTargetLoading, setActiveTargetLoading] = useState(false);
  const [customMockLoading, setCustomMockLoading] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());

  const toggleDomain = useCallback((domain: string) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  }, []);

  async function startSession(intent: string, focusDomains?: string[]) {
    const body: Record<string, unknown> = {
      exam_profile_id: data.profileId,
      session_intent: intent,
    };
    if (focusDomains && focusDomains.length > 0) {
      body.focus_domains = focusDomains;
    }

    const res = await fetch(`${TUTOR_ROUTES.API_SESSION_START}?stream=false`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: "Failed to start session" }));
      throw new Error(errBody.error || "Failed to start session");
    }

    const json = await res.json();
    return json.session_id as string;
  }

  async function handleAlgorithmicReview() {
    setAlgoReviewLoading(true);
    try {
      const sessionId = await startSession("spaced_review");
      router.push(TUTOR_ROUTES.SESSION(sessionId));
    } catch (err: any) {
      toast.error(err.message || "Failed to start review session");
    } finally {
      setAlgoReviewLoading(false);
    }
  }

  async function handleActiveTarget() {
    setActiveTargetLoading(true);
    try {
      const sessionId = await startSession("active_target", data.activeTargets);
      router.push(TUTOR_ROUTES.SESSION(sessionId));
    } catch (err: any) {
      toast.error(err.message || "Failed to start active target session");
    } finally {
      setActiveTargetLoading(false);
    }
  }

  async function handleCustomMock() {
    const domains = Array.from(selectedDomains);
    if (domains.length === 0) {
      toast.error("Select at least one domain to build a custom session.");
      return;
    }

    setCustomMockLoading(true);
    try {
      const sessionId = await startSession("custom_mock", domains);
      router.push(TUTOR_ROUTES.SESSION(sessionId));
    } catch (err: any) {
      toast.error(err.message || "Failed to start custom session");
    } finally {
      setCustomMockLoading(false);
    }
  }

  const directive = getDirectiveText(data);
  const selectedCount = selectedDomains.size;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Section 1: Status Strip */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{data.examName}</span>
          <span className="text-muted-foreground">
            &middot; {data.daysRemaining} day{data.daysRemaining !== 1 ? "s" : ""} left
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Readiness:</span>
          <span className="font-bold text-lg tabular-nums">
            {data.readinessIndex}/100
          </span>
        </div>
      </div>

      {/* Section 2: Directive Hero */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="pt-6">
          <p className="text-base font-semibold leading-snug">
            {directive.heading}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {directive.subtext}
          </p>
          <Button
            size="lg"
            className="mt-4 w-full sm:w-auto min-w-[220px]"
            onClick={handleAlgorithmicReview}
            disabled={algoReviewLoading}
          >
            {algoReviewLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Start Session
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Section 3: Active Target */}
      {data.activeTargets.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">Pinned:</span>
          <div className="flex flex-wrap gap-1.5">
            {data.activeTargets.map((target) => (
              <Badge key={target} variant="secondary" className="text-xs">
                {target}
              </Badge>
            ))}
          </div>
          <button
            type="button"
            onClick={handleActiveTarget}
            disabled={activeTargetLoading}
            className="text-primary hover:underline text-xs ml-auto shrink-0 disabled:opacity-50"
          >
            {activeTargetLoading ? "Starting..." : "Practice targets →"}
          </button>
        </div>
      )}

      {/* Section 4: Secondary Row */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create a Quiz
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomOpen((prev) => !prev)}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Build Custom Session
            {customOpen ? (
              <ChevronUp className="ml-1 h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {customOpen && (
          <div className="rounded-lg border p-4 space-y-3">
            {data.domainBreakdown.length > 0 ? (
              <>
                <div className="space-y-1 max-h-[240px] overflow-y-auto">
                  {data.domainBreakdown
                    .sort((a, b) => a.domain.localeCompare(b.domain))
                    .map((d) => (
                      <label
                        key={d.domain}
                        className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDomains.has(d.domain)}
                          onChange={() => toggleDomain(d.domain)}
                          className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                        />
                        <span className="text-sm flex-1">{d.domain}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {Math.round(d.score * 100)}%
                        </span>
                      </label>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {selectedCount > 0
                      ? `${selectedCount} domain${selectedCount !== 1 ? "s" : ""} selected`
                      : "Select domains to build your session"}
                  </span>
                  <Button
                    size="sm"
                    onClick={handleCustomMock}
                    disabled={customMockLoading || selectedCount === 0}
                  >
                    {customMockLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Building...
                      </>
                    ) : (
                      `Start (${TUTOR_CONFIG.DEFAULT_QUESTION_COUNT} Qs)`
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete your first session to unlock the custom mock builder.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Section 5: Momentum Strip */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>{data.quickStats.streak} day streak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessagesSquare className="w-4 h-4" />
          <span>{data.quickStats.totalQuestions.toLocaleString()} answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{data.quickStats.sessionsCompleted} completed</span>
        </div>
      </div>

      {/* Section 6: Weakest Spots */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Weakest spots</h3>
        {data.domainBreakdown.length > 0 ? (
          <>
            <div className="space-y-3">
              {data.domainBreakdown
                .sort((a, b) => a.score - b.score)
                .slice(0, 5)
                .map((d) => (
                  <DomainBar key={d.domain} domain={d.domain} score={d.score} />
                ))}
            </div>
            <Link
              href="/analytics"
              className="text-xs text-primary hover:underline mt-3 inline-block"
            >
              View full breakdown &rarr;
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Complete your first session to see domain mastery scores.
          </p>
        )}
      </div>
    </div>
  );
}

export default DashboardView;
