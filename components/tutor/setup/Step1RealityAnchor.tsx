// Path: components/tutor/setup/Step1RealityAnchor.tsx

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelfAssessment, TimeMode } from "@/types/tutor";
import { SegmentedControl } from "./SegmentedControl";
import { TimeModeBadge } from "./TimeModeBadge";

function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface Step1RealityAnchorProps {
  exam: string;
  examNames: string[];
  targetDate: string;
  subjects: string[];
  assessments: Record<string, SelfAssessment>;
  timeMode: TimeMode | null;
  onExamChange: (value: string) => void;
  onTargetDateChange: (value: string) => void;
  onAssessmentChange: (subject: string, level: SelfAssessment) => void;
  selectRef: React.RefObject<HTMLButtonElement | null>;
}

export function Step1RealityAnchor({
  exam,
  examNames,
  targetDate,
  subjects,
  assessments,
  timeMode,
  onExamChange,
  onTargetDateChange,
  onAssessmentChange,
  selectRef,
}: Step1RealityAnchorProps) {
  return (
    <Card className="w-full">
      <CardContent className="space-y-5 pt-6">
        {/* Exam Selection */}
        <div className="space-y-2">
          <Label htmlFor="exam-select">What exam are you preparing for?</Label>
          <Select value={exam} onValueChange={onExamChange}>
            <SelectTrigger ref={selectRef} id="exam-select">
              <SelectValue placeholder="Select your exam..." />
            </SelectTrigger>
            <SelectContent>
              {examNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Picker */}
        {exam && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="target-date">When is your exam?</Label>
            <input
              id="target-date"
              type="date"
              min={getTodayISO()}
              value={targetDate}
              onChange={(e) => onTargetDateChange(e.target.value)}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
                "transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />

            {timeMode && (
              <div className="pt-1">
                <TimeModeBadge mode={timeMode} />
              </div>
            )}
          </div>
        )}

        {/* Self-Assessment */}
        {exam && subjects.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <Label className="text-sm font-medium">
                Rate your current understanding
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Be honest — this helps us tailor difficulty to your actual level.
              </p>
            </div>

            <div className="space-y-3">
              {subjects.map((subject) => (
                <div
                  key={subject}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/60 px-4 py-2.5"
                >
                  <span className="text-sm font-medium truncate">
                    {subject}
                  </span>
                  <SegmentedControl
                    value={assessments[subject] ?? null}
                    onChange={(level) => onAssessmentChange(subject, level)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
