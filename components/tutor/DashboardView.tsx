// Path: components/tutor/DashboardView.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import type { DashboardPageData } from "@/app/dashboard/page";
import { TUTOR_ROUTES, TUTOR_CONFIG } from "@/lib/constants/tutor";
import { toast } from "sonner";
import {
  Zap,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Crosshair,
  Settings2,
  Loader2,
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

function SessionRow({ session }: { session: DashboardPageData["recentSessions"][number] }) {
  const date = new Date(session.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const statusIcon =
    session.status === "active" ? (
      <Zap className="w-3.5 h-3.5 text-yellow-500" />
    ) : session.status === "completed" ? (
      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
    ) : (
      <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
    );

  const domainCount = session.target_domains?.length ?? 0;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="flex-shrink-0">{statusIcon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {session.status === "active" ? "Active session" : "Session"}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {session.status}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {date} &middot; {domainCount} domain{domainCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <div className="text-lg font-bold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function DashboardViewLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <Skeleton className="h-24 w-full rounded-xl" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
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
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [customOpen, setCustomOpen] = useState(false);

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

  const customMocksRemaining = Math.max(0, TUTOR_CONFIG.MAX_CUSTOM_MOCK_PER_DAY - data.customMockCountToday);
  const hasActiveTargets = data.activeTargets.length > 0;
  const selectedCount = selectedDomains.size;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Section 1: Algorithmic Review */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              {data.overdueDomainCount > 0
                ? `${data.overdueDomainCount} Topic${data.overdueDomainCount !== 1 ? "s" : ""} Due for Review`
                : "Algorithmic Review"}
            </CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            Spaced repetition review of your weakest and most overdue topics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="w-full sm:w-auto min-w-[220px]"
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
                Start Daily Review
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: Active Target */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Active Target</CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            Practice topics you have pinned from Setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasActiveTargets ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {data.activeTargets.map((target) => (
                  <Badge key={target} variant="secondary">
                    {target}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={handleActiveTarget}
                disabled={activeTargetLoading}
              >
                {activeTargetLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Practice Current Target
                  </>
                )}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active targets set. Visit Setup to pin your current study topics.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Custom Mock Builder */}
      <Collapsible open={customOpen} onOpenChange={setCustomOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Build Your Own Session</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Select specific domains to focus on for a custom mock session.
                  </CardDescription>
                </div>
              </div>
              {customOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {data.domainBreakdown.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {data.domainBreakdown
                      .sort((a, b) => a.domain.localeCompare(b.domain))
                      .map((d) => (
                        <label
                          key={d.domain}
                          className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
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

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      {selectedCount > 0
                        ? `${selectedCount} domain${selectedCount !== 1 ? "s" : ""} selected`
                        : "No domains selected"}
                    </p>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <Button
                        onClick={handleCustomMock}
                        disabled={customMockLoading || selectedCount === 0}
                      >
                        {customMockLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Building...
                          </>
                        ) : (
                          `Build Custom Session (${TUTOR_CONFIG.DEFAULT_QUESTION_COUNT} Qs)`
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {customMocksRemaining} custom mock{customMocksRemaining !== 1 ? "s" : ""} remaining today
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Complete your first session to unlock the custom mock builder.
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Target}
          label="Questions answered"
          value={data.quickStats.totalQuestions.toLocaleString()}
        />
        <StatCard
          icon={Zap}
          label="Day streak"
          value={`${data.quickStats.streak}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Sessions completed"
          value={`${data.quickStats.sessionsCompleted}`}
        />
      </div>

      {/* Domain Mastery + Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Domain Mastery
            </CardTitle>
            <CardDescription>
              Mastery scores across {data.domainBreakdown.length} domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.domainBreakdown.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {data.domainBreakdown
                  .sort((a, b) => b.score - a.score)
                  .map((d) => (
                    <DomainBar key={d.domain} domain={d.domain} score={d.score} />
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Complete your first session to see domain mastery scores.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Sessions
            </CardTitle>
            <CardDescription>
              {data.recentSessions.length > 0
                ? `Last ${data.recentSessions.length} session${data.recentSessions.length !== 1 ? "s" : ""}`
                : "No sessions yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentSessions.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto pr-1">
                {data.recentSessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Start your first session to begin tracking your progress.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardView;
