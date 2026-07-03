// Path: components/tutor/SessionStartView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TUTOR_ROUTES } from "@/lib/constants/tutor";
import { toast } from "sonner";
import { Play, BookOpen, Clock, AlertCircle, Eye, EyeOff, Info } from "lucide-react";

interface SessionStartViewProps {
  profileId: string;
  examName: string;
  daysRemaining: number;
  hasActiveSession: boolean;
  activeSessionId: string | null;
}

export function SessionStartView({
  profileId,
  examName,
  daysRemaining,
  hasActiveSession,
  activeSessionId,
}: SessionStartViewProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [sessionIntent, setSessionIntent] = useState<"tracked" | "quiet">("tracked");

  async function handleStartSession(intent: "tracked" | "quiet") {
    if (hasActiveSession && activeSessionId) {
      router.push(TUTOR_ROUTES.SESSION(activeSessionId));
      return;
    }

    setIsStarting(true);
    setStartError(null);

    try {
      const res = await fetch(`${TUTOR_ROUTES.API_SESSION_START}?stream=false`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_profile_id: profileId, session_intent: intent }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to start session");
      }

      const { session_id } = await res.json();
      router.push(TUTOR_ROUTES.SESSION(session_id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setStartError(message);
      toast.error(message);
    } finally {
      setIsStarting(false);
    }
  }

  const urgencyLabel =
    daysRemaining <= 0
      ? "Exam is today or past due"
      : daysRemaining === 1
        ? "day until"
        : "days until";

  return (
    <div className="max-w-lg mx-auto space-y-6 px-4 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Practice</h2>
        <p className="text-muted-foreground">
          10 personalized questions based on your recent mistakes.
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {examName}
          </CardTitle>
          <CardDescription>
            {hasActiveSession
              ? "You have an active session in progress"
              : "Choose session type — both feed your model"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {daysRemaining <= 0 ? "Exam now" : `${daysRemaining} ${urgencyLabel}`}
              </span>
            </div>
          </div>

          {!hasActiveSession && (
            <div className="space-y-3 p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                Session Type
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={sessionIntent === "tracked" ? "default" : "outline"}
                  className="h-20 flex-col gap-2 text-left"
                  onClick={() => setSessionIntent("tracked")}
                  disabled={isStarting}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span className="font-medium">Tracked</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-tight">
                    Updates your visible projection
                  </p>
                </Button>
                <Button
                  variant={sessionIntent === "quiet" ? "default" : "outline"}
                  className="h-20 flex-col gap-2 text-left"
                  onClick={() => setSessionIntent("quiet")}
                  disabled={isStarting}
                >
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-5 h-5" />
                    <span className="font-medium">Quiet</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-tight">
                    Model learns, projection hidden
                  </p>
                </Button>
              </div>
              <p className="text-xs text-slate-500 text-center">
                {sessionIntent === "tracked"
                  ? "Your projected percentile band will update after this session."
                  : "This drill won't move your visible projection today, but it still helps Gibbi understand your baseline."}
              </p>
            </div>
          )}

          {startError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{startError}</span>
            </div>
          )}

          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold"
            onClick={() => handleStartSession(sessionIntent)}
            disabled={isStarting}
          >
            {isStarting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Starting...
              </span>
            ) : hasActiveSession ? (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Resume Session
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Start {sessionIntent === "tracked" ? "Tracked" : "Quiet"} Practice
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
