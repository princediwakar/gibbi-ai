// Path: components/tutor/setup/StepIndicator.tsx

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Reality Anchor" },
  { id: 2, label: "Active Target" },
  { id: 3, label: "The Contract" },
  { id: 4, label: "Assessment" },
] as const;

export { STEPS };

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding progress" className="mb-8">
      <ol className="flex items-center justify-center gap-0">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isUpcoming = stepNum > currentStep;

          return (
            <li key={stepNum} className="flex items-center">
              {/* Connecting line (before each step except the first) */}
              {stepNum > 1 && (
                <div
                  className={cn(
                    "h-px w-8 sm:w-12 mx-1 transition-colors duration-300",
                    isCompleted || isCurrent
                      ? "bg-primary"
                      : "bg-border",
                  )}
                />
              )}

              <div className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                    isCompleted &&
                      "bg-primary text-primary-foreground",
                    isCurrent &&
                      "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isUpcoming &&
                      "border-2 border-border bg-background text-muted-foreground",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    stepNum
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap transition-colors duration-300",
                    isUpcoming ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {STEPS[i].label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
