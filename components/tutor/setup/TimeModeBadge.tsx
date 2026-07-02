// Path: components/tutor/setup/TimeModeBadge.tsx

import { cn } from "@/lib/utils";
import type { TimeMode } from "@/types/tutor";

const TIME_MODE_META: Record<
  TimeMode,
  { label: string; description: string; badge: string; ring: string; bg: string; text: string }
> = {
  foundation: {
    label: "Foundation Mode",
    description: "You have time to build deep understanding",
    badge:
      "border-green-400/40 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-950/60 dark:text-green-400",
    ring: "ring-green-400/30",
    bg: "bg-green-50 dark:bg-green-950/60",
    text: "text-green-800 dark:text-green-400",
  },
  acceleration: {
    label: "Acceleration Mode",
    description: "Focused practice for steady improvement",
    badge:
      "border-amber-400/40 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-400",
    ring: "ring-amber-400/30",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-800 dark:text-amber-400",
  },
  triage: {
    label: "Triage Mode",
    description: "Intensive prep on highest-yield topics",
    badge:
      "border-red-400/40 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/60 dark:text-red-400",
    ring: "ring-red-400/30",
    bg: "bg-red-50 dark:bg-red-950/60",
    text: "text-red-800 dark:text-red-400",
  },
};

interface TimeModeBadgeProps {
  mode: TimeMode;
}

export function TimeModeBadge({ mode }: TimeModeBadgeProps) {
  const meta = TIME_MODE_META[mode];
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300",
        meta.badge,
      )}
    >
      <p className="font-semibold">{meta.label}</p>
      <p className="text-xs opacity-80 mt-0.5">{meta.description}</p>
    </div>
  );
}
