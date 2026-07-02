// Path: components/tutor/setup/SegmentedControl.tsx
"use client";

import { cn } from "@/lib/utils";
import type { SelfAssessment } from "@/types/tutor";

const ASSESSMENT_LEVELS: SelfAssessment[] = ["weak", "okay", "strong"];

const ASSESSMENT_LABELS: Record<SelfAssessment, string> = {
  weak: "Weak",
  okay: "Okay",
  strong: "Strong",
};

const ASSESSMENT_COLORS: Record<
  SelfAssessment,
  { selected: string; ring: string }
> = {
  weak: {
    selected:
      "bg-red-50 border-red-300 text-red-800 dark:bg-red-950/50 dark:border-red-500/40 dark:text-red-400",
    ring: "ring-red-400/30",
  },
  okay: {
    selected:
      "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-500/40 dark:text-amber-400",
    ring: "ring-amber-400/30",
  },
  strong: {
    selected:
      "bg-green-50 border-green-300 text-green-800 dark:bg-green-950/50 dark:border-green-500/40 dark:text-green-400",
    ring: "ring-green-400/30",
  },
};

export { ASSESSMENT_LEVELS, ASSESSMENT_LABELS };

interface SegmentedControlProps {
  value: SelfAssessment | null;
  onChange: (level: SelfAssessment) => void;
}

export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  return (
    <div
      className="inline-flex rounded-lg p-0.5 gap-0.5"
      role="radiogroup"
    >
      {ASSESSMENT_LEVELS.map((level) => {
        const isSelected = value === level;
        const colors = ASSESSMENT_COLORS[level];

        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(level)}
            className={cn(
              "relative px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
              "border border-transparent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isSelected
                ? cn(colors.selected, "shadow-sm")
                : cn(
                    "text-foreground/70 bg-transparent border border-input",
                    "hover:text-foreground hover:border-foreground/30",
                  ),
            )}
          >
            {ASSESSMENT_LABELS[level]}
          </button>
        );
      })}
    </div>
  );
}
