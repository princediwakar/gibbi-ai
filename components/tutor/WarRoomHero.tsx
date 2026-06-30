// Path: components/tutor/WarRoomHero.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { TUTOR_ROUTES } from "@/lib/constants/tutor";

interface WarRoomHeroProps {
  directive: string;
  daysRemaining: number;
  readinessIndex: number;
  examName: string;
}

export function WarRoomHero({
  directive,
  daysRemaining,
  readinessIndex,
  examName,
}: WarRoomHeroProps) {
  const router = useRouter();

  const daysLabel =
    daysRemaining <= 0 ? "Now" : daysRemaining === 1 ? "1" : `${daysRemaining}`;
  const daysUnit =
    daysRemaining <= 0
      ? "Exam is here"
      : daysRemaining === 1
        ? "day"
        : "days";

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 md:px-8 bg-muted/30 border rounded-2xl mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <h2 className="text-3xl md:text-5xl font-extrabold text-foreground text-center tracking-tight max-w-3xl mb-8 leading-tight">
        {directive}
      </h2>

      <Button
        size="lg"
        className="px-12 py-8 text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.3)]"
        onClick={() => router.push(TUTOR_ROUTES.SESSION_START)}
      >
        <Zap className="mr-3 h-6 w-6" />
        Start Practice
      </Button>
      <p className="mt-4 text-sm text-muted-foreground font-medium">
        10 personalized questions based on your recent mistakes.
      </p>

      <div className="flex flex-wrap justify-center gap-6 md:gap-16 mt-12 pt-8 border-t w-full max-w-2xl">
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Days Until {examName}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground tabular-nums">
              {daysLabel}
            </span>
            {daysRemaining > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                {daysUnit}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Readiness
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-3xl font-bold tabular-nums ${
                readinessIndex < 40
                  ? "text-red-500"
                  : readinessIndex < 70
                    ? "text-yellow-500"
                    : "text-green-500"
              }`}
            >
              {readinessIndex}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              /100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WarRoomHero;
