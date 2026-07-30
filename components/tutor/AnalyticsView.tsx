// Path: components/tutor/AnalyticsView.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Target, TrendingUp, Zap, Clock, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";
import type { AnalyticsPageData } from "@/app/analytics/page";

function DomainBar({ domain, score, totalAttempted }: { domain: string; score: number; totalAttempted: number }) {
  const pct = Math.round(score * 100);
  const notStarted = totalAttempted === 0;
  const barColor =
    score < 0.3 && !notStarted ? "bg-red-500" : score >= 0.7 && !notStarted ? "bg-green-500" : "bg-yellow-500";

  return (
    <div className="p-4 rounded-xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border/60 group">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-semibold text-foreground">{domain}</span>
        <span className="text-sm font-bold tabular-nums text-muted-foreground">{notStarted ? "0%" : `${pct}%`}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${notStarted ? "bg-transparent" : barColor}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: AnalyticsPageData["recentSessions"][number] }) {
  const date = new Date(session.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const statusIcon =
    session.status === "active" ? (
      <Zap className="w-4 h-4 text-yellow-600" />
    ) : session.status === "completed" ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-muted-foreground" />
    );
  
  const statusBg = 
    session.status === "active" ? "bg-yellow-500/10" :
    session.status === "completed" ? "bg-green-500/10" :
    "bg-muted";

  const statusTextColor = 
    session.status === "active" ? "text-yellow-700" :
    session.status === "completed" ? "text-green-700" :
    "text-muted-foreground";

  const domainCount = session.target_domains?.length ?? 0;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border/60">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${statusBg}`}>
        {statusIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold">
            {session.status === "active" ? "Active session" : "Session"}
          </span>
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${statusBg} ${statusTextColor}`}>
            {session.status}
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-medium">
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
    <Card className="border shadow-sm bg-card hover:border-primary/20 transition-colors">
      <CardContent className="p-5 flex items-center gap-5">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-black leading-none mb-1.5">{value}</div>
          <div className="text-sm text-muted-foreground font-semibold">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsView({ data }: { data: AnalyticsPageData }) {
  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 py-6">
      {/* Section 1: Status Strip */}
      <div className="flex items-center justify-between text-sm bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-bold text-base">Analytics Overview</div>
            <div className="text-muted-foreground text-xs">
              Your mastery across {data.domainBreakdown.length} domains in {data.examName}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-0.5">Overall Readiness</div>
          <div className="font-black text-2xl tabular-nums leading-none flex items-baseline justify-end gap-1">
            <span className={
              data.readinessIndex < 40 ? "text-red-500" :
              data.readinessIndex < 70 ? "text-yellow-500" :
              "text-green-500"
            }>{data.readinessIndex}</span>
            <span className="text-muted-foreground text-base font-medium">/100</span>
          </div>
        </div>
      </div>

      {/* Section 2: Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={Target}
          label="Questions answered"
          value={data.totalQuestions.toLocaleString()}
        />
        <StatCard icon={Zap} label="Day streak" value={`${data.streak}`} />
        <StatCard
          icon={TrendingUp}
          label="Sessions completed"
          value={`${data.sessionsCompleted}`}
        />
      </div>

      {/* Section 3: Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border shadow-sm h-fit">
          <CardHeader className="border-b bg-muted/20 py-4 px-5">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Domain Mastery
            </CardTitle>
            <CardDescription className="text-xs">
              Mastery scores across {data.domainBreakdown.length} domains
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            {data.domainBreakdown.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto p-2 space-y-1">
                {data.domainBreakdown
                  .sort((a, b) => a.score - b.score)
                  .map((d) => (
                    <DomainBar key={d.domain} domain={d.domain} score={d.score} totalAttempted={d.totalAttempted} />
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">
                Complete your first session to see domain mastery scores.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm h-fit">
          <CardHeader className="border-b bg-muted/20 py-4 px-5">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Sessions
            </CardTitle>
            <CardDescription className="text-xs">
              {data.recentSessions.length > 0
                ? `Last ${data.recentSessions.length} session${data.recentSessions.length !== 1 ? "s" : ""}`
                : "No sessions yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            {data.recentSessions.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto p-2 space-y-1">
                {data.recentSessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">
                Start your first session to begin tracking your progress.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsView;
