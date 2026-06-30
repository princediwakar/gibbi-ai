// Path: components/tutor/SessionAutoStarter.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TUTOR_ROUTES } from "@/lib/constants/tutor";
import { SessionStartView } from "@/components/tutor/SessionStartView";

interface SessionAutoStarterProps {
  profileId: string;
  examName: string;
  daysRemaining: number;
}

export function SessionAutoStarter({
  profileId,
  examName,
  daysRemaining,
}: SessionAutoStarterProps) {
  const router = useRouter();
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function startSession() {
      try {
        const res = await fetch(`${TUTOR_ROUTES.API_SESSION_START}?stream=false`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exam_profile_id: profileId }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to start session");
        }

        const { session_id } = await res.json();
        if (!cancelled) {
          router.push(TUTOR_ROUTES.SESSION(session_id));
        }
      } catch (err) {
        if (!cancelled) {
          setStartError(
            err instanceof Error ? err.message : "Something went wrong. Please try again."
          );
          setIsStarting(false);
        }
      }
    }

    startSession();

    return () => {
      cancelled = true;
    };
  }, [profileId, router]);

  if (isStarting) {
    return (
      <div className="max-w-lg mx-auto space-y-6 px-4 py-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Practice</h2>
          <p className="text-muted-foreground">
            10 personalized questions based on your recent mistakes.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Starting your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 px-4 py-12">
      {startError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <span>{startError}</span>
        </div>
      )}
      <SessionStartView
        profileId={profileId}
        examName={examName}
        daysRemaining={daysRemaining}
        hasActiveSession={false}
        activeSessionId={null}
      />
    </div>
  );
}
