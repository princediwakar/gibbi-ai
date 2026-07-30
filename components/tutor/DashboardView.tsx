// Path: components/tutor/DashboardView.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { DashboardPageData, SyllabusSubject, SyllabusDomain } from "@/app/dashboard/page";
import { TUTOR_ROUTES, TUTOR_CONFIG } from "@/lib/constants/tutor";
import { toast } from "sonner";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarDays,
  Play,
  ArrowRight,
  Clock,
  Lock,
  BookOpen
} from "lucide-react";

export function DashboardViewLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
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
  const [linearNextLoading, setLinearNextLoading] = useState(false);
  const [domainLoading, setDomainLoading] = useState<string | null>(null);
  const [isLinearMode, setIsLinearMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gibbi_linear_mode");
    if (saved) {
      setIsLinearMode(saved === "true");
    }
  }, []);

  const handleToggleLinear = useCallback((checked: boolean) => {
    setIsLinearMode(checked);
    localStorage.setItem("gibbi_linear_mode", String(checked));
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

  async function handleDomainPractice(domain: string) {
    setDomainLoading(domain);
    try {
      const sessionId = await startSession("custom_mock", [domain]);
      router.push(TUTOR_ROUTES.SESSION(sessionId));
    } catch (err: any) {
      toast.error(err.message || "Failed to start custom session");
    } finally {
      setDomainLoading(null);
    }
  }

  // Find next topic in linear sequence
  let nextLinearDomain: SyllabusDomain | null = null;
  for (const subject of data.syllabus) {
    for (const domain of subject.domains) {
      if (domain.masteryScore < 0.7) { // Define "not mastered" as < 70%
        nextLinearDomain = domain;
        break;
      }
    }
    if (nextLinearDomain) break;
  }

  async function handleLinearNext() {
    if (!nextLinearDomain) {
      toast.success("You have mastered all topics!");
      return;
    }
    setLinearNextLoading(true);
    try {
      const sessionId = await startSession("custom_mock", [nextLinearDomain.name]);
      router.push(TUTOR_ROUTES.SESSION(sessionId));
    } catch (err: any) {
      toast.error(err.message || "Failed to start session");
    } finally {
      setLinearNextLoading(false);
    }
  }

  const now = new Date();

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 py-6">
      {/* Section 1: Status Strip */}
      <div className="flex items-center justify-between text-sm bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-bold text-base">{data.examName}</div>
            <div className="text-muted-foreground text-xs">
              {data.daysRemaining} day{data.daysRemaining !== 1 ? "s" : ""} left
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-0.5">Readiness</div>
          <div className="font-black text-2xl tabular-nums leading-none">
            {data.readinessIndex}<span className="text-muted-foreground text-base font-medium">/100</span>
          </div>
        </div>
      </div>

      {/* Section 2: Smart Start Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-lg">AI Pick</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Spaced repetition algorithm. Targets your weakest and overdue topics across all subjects.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleAlgorithmicReview}
              disabled={algoReviewLoading || linearNextLoading}
            >
              {algoReviewLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> Start Spaced Review</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:border-border/80 transition-colors">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowRight className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-lg">Linear: Next Topic</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {nextLinearDomain 
                  ? `Next up in curriculum sequence: ${nextLinearDomain.name}.`
                  : "You've mastered all topics! Keep up the spaced reviews."}
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={handleLinearNext}
              disabled={!nextLinearDomain || algoReviewLoading || linearNextLoading}
            >
              {linearNextLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> Practice {nextLinearDomain?.name || "Next"}</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Syllabus Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Syllabus Map</h2>
            <p className="text-muted-foreground text-sm">Practice topics individually based on mastery.</p>
          </div>
          <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg">
            <Label htmlFor="linear-mode" className="text-sm font-medium cursor-pointer">
              Linear Mode
            </Label>
            <input
              type="checkbox"
              id="linear-mode"
              checked={isLinearMode}
              onChange={(e) => handleToggleLinear(e.target.checked)}
              className="h-4 w-4 rounded border-primary text-primary focus:ring-primary accent-primary cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data.syllabus.map((subject) => {
            let hasWeakPrerequisite = false;

            return (
              <Card key={subject.name} className="flex flex-col border shadow-sm h-fit">
                <CardHeader className="py-4 px-5 border-b bg-muted/20">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    {subject.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {subject.domains.map((domain) => {
                      const pct = Math.round(domain.masteryScore * 100);
                      const notStarted = domain.totalAttempted === 0;
                      const isOverdue = !notStarted && domain.nextReviewAt ? new Date(domain.nextReviewAt) < now : false;
                      const isWeak = domain.masteryScore < 0.3 && !notStarted;
                      const isStrong = domain.masteryScore >= 0.7 && !notStarted;

                      // Linear Mode Logic
                      let isFutureTopic = false;
                      if (isLinearMode) {
                        if (hasWeakPrerequisite) {
                          isFutureTopic = true;
                        }
                        if (isWeak || notStarted) {
                          hasWeakPrerequisite = true;
                        }
                      }

                      const barColor = isWeak ? "bg-red-500" : isStrong ? "bg-green-500" : "bg-yellow-500";

                      return (
                        <div key={domain.name} className={`p-4 hover:bg-muted/30 transition-all flex flex-col gap-3 group ${isFutureTopic ? "opacity-50 hover:opacity-100 grayscale hover:grayscale-0" : ""}`}>
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                <span className="font-medium text-sm leading-snug mr-1">{domain.name}</span>
                                {isOverdue && (
                                  <Badge variant="outline" className="text-[10px] whitespace-nowrap uppercase px-1.5 h-4 border-orange-500/30 text-orange-600 bg-orange-500/10 shrink-0">
                                    <Clock className="w-3 h-3 mr-1" /> Due
                                  </Badge>
                                )}
                                {isStrong && !isOverdue && (
                                  <Badge variant="outline" className="text-[10px] whitespace-nowrap uppercase px-1.5 h-4 border-green-500/30 text-green-600 bg-green-500/10 shrink-0">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Strong
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden flex-1 max-w-[120px]">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${notStarted ? "bg-transparent" : barColor}`}
                                    style={{ width: `${Math.max(pct, 2)}%` }}
                                  />
                                </div>
                                <span className="text-xs tabular-nums text-muted-foreground w-8">
                                  {notStarted ? "0%" : `${pct}%`}
                                </span>
                              </div>
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant={isOverdue ? "default" : "outline"}
                              className={`shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ${domainLoading === domain.name ? "opacity-100" : ""}`}
                              onClick={() => handleDomainPractice(domain.name)}
                              disabled={domainLoading === domain.name}
                            >
                              {domainLoading === domain.name ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Practice"
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
