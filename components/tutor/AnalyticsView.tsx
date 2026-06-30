// Path: components/tutor/AnalyticsView.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Target, TrendingUp, Zap, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { AnalyticsPageData } from "@/app/analytics/page";

function DomainBar({ domain, score }: { domain: string; score: number }) {
  const pct = Math.round(score * 100);
  const barColor =
    score < 0.4 ? "bg-red-500" : score < 0.7 ? "bg-yellow-500" : "bg-green-500";

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

function SessionRow({ session }: { session: AnalyticsPageData["recentSessions"][number] }) {
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

export function AnalyticsView({ data }: { data: AnalyticsPageData }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground text-sm">
            Your mastery and progress across {data.domainBreakdown.length} domains
          </p>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-3xl font-bold tabular-nums ${
              data.readinessIndex < 40
                ? "text-red-500"
                : data.readinessIndex < 70
                  ? "text-yellow-500"
                  : "text-green-500"
            }`}
          >
            {data.readinessIndex}
          </span>
          <span className="text-sm text-muted-foreground">/100 readiness</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Domain Mastery
            </CardTitle>
            <CardDescription>
              Mastery scores across {data.domainBreakdown.length} domains in {data.examName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.domainBreakdown.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {data.domainBreakdown
                  .sort((a, b) => a.score - b.score)
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
              <div className="max-h-[500px] overflow-y-auto pr-1">
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

export default AnalyticsView;
