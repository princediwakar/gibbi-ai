// Path: components/tutor/SetupForm.tsx
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { getTimeMode } from "@/lib/sm2";
import { TUTOR_ROUTES } from "@/lib/constants/tutor";
import { cn } from "@/lib/utils";
import { createExamProfile } from "@/lib/actions/tutor";
import type { TimeMode, SelfAssessment } from "@/types/tutor";
import type { ExamProfileInput } from "@/lib/validations/tutor";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ASSESSMENT_LEVELS: SelfAssessment[] = ["weak", "okay", "strong"];

const ASSESSMENT_LABELS: Record<SelfAssessment, string> = {
  weak: "Weak",
  okay: "Okay",
  strong: "Strong",
};

const TIME_MODE_META: Record<
  TimeMode,
  { label: string; description: string; badge: string; ring: string; bg: string; text: string }
> = {
  foundation: {
    label: "Foundation Mode",
    description: "You have time to build deep understanding",
    badge: "border-green-400/40 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-950/60 dark:text-green-400",
    ring: "ring-green-400/30",
    bg: "bg-green-50 dark:bg-green-950/60",
    text: "text-green-800 dark:text-green-400",
  },
  acceleration: {
    label: "Acceleration Mode",
    description: "Focused practice for steady improvement",
    badge: "border-amber-400/40 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-400",
    ring: "ring-amber-400/30",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-800 dark:text-amber-400",
  },
  triage: {
    label: "Triage Mode",
    description: "Intensive prep on highest-yield topics",
    badge: "border-red-400/40 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/60 dark:text-red-400",
    ring: "ring-red-400/30",
    bg: "bg-red-50 dark:bg-red-950/60",
    text: "text-red-800 dark:text-red-400",
  },
};

const ASSESSMENT_COLORS: Record<
  SelfAssessment,
  { selected: string; hover: string; ring: string }
> = {
  weak: {
    selected:
      "bg-red-50 border-red-300 text-red-800 dark:bg-red-950/50 dark:border-red-500/40 dark:text-red-400",
    hover: "hover:bg-red-50/50 dark:hover:bg-red-950/30",
    ring: "ring-red-400/30",
  },
  okay: {
    selected:
      "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-500/40 dark:text-amber-400",
    hover: "hover:bg-amber-50/50 dark:hover:bg-amber-950/30",
    ring: "ring-amber-400/30",
  },
  strong: {
    selected:
      "bg-green-50 border-green-300 text-green-800 dark:bg-green-950/50 dark:border-green-500/40 dark:text-green-400",
    hover: "hover:bg-green-50/50 dark:hover:bg-green-950/30",
    ring: "ring-green-400/30",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  return Math.ceil(
    (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SegmentedControl({
  value,
  onChange,
}: {
  value: SelfAssessment | null;
  onChange: (level: SelfAssessment) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-input p-0.5 gap-0.5" role="radiogroup">
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
                    "text-muted-foreground border-transparent bg-transparent",
                    colors.hover
                  )
            )}
          >
            {ASSESSMENT_LABELS[level]}
          </button>
        );
      })}
    </div>
  );
}

function TimeModeBadge({ mode }: { mode: TimeMode }) {
  const meta = TIME_MODE_META[mode];
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300",
        meta.badge
      )}
    >
      <p className="font-semibold">{meta.label}</p>
      <p className="text-xs opacity-80 mt-0.5">{meta.description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SetupFormPrefill {
  exam: string;
  targetDate: string;
  assessments: Record<string, SelfAssessment>;
  isExisting: boolean;
}

interface SetupFormProps {
  prefill: SetupFormPrefill | null;
  examNames: string[];
  examSubjects: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function SetupForm({ prefill, examNames, examSubjects }: SetupFormProps) {
  const router = useRouter();

  const [exam, setExam] = useState<string>(prefill?.exam ?? "");
  const [targetDate, setTargetDate] = useState<string>(prefill?.targetDate ?? "");
  const [assessments, setAssessments] = useState<Record<string, SelfAssessment>>(
    prefill?.assessments ?? {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectRef = useRef<HTMLButtonElement>(null);
  const isExisting = prefill?.isExisting ?? false;

  useEffect(() => {
    const timer = setTimeout(() => selectRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  // Derived
  const subjects = useMemo<string[]>(() => {
    if (!exam) return [];
    return examSubjects[exam] ?? [];
  }, [exam, examSubjects]);

  const timeMode = useMemo<TimeMode | null>(() => {
    if (!targetDate) return null;
    const days = daysBetween(targetDate, getTodayISO());
    return getTimeMode(days);
  }, [targetDate]);

  const allAssessed = useMemo(() => {
    if (subjects.length === 0) return false;
    return subjects.every((s) => assessments[s] != null);
  }, [subjects, assessments]);

  const canSubmit = exam && targetDate && allAssessed && !isSubmitting;

  // Handlers
  const handleExamChange = useCallback((value: string) => {
    setExam(value);
    setAssessments({});
  }, []);

  const handleAssessmentChange = useCallback(
    (subject: string, level: SelfAssessment) => {
      setAssessments((prev) => ({ ...prev, [subject]: level }));
    },
    []
  );

  const saveProfile = useCallback(async () => {
    if (!canSubmit || !timeMode) return null;

    return createExamProfile({
      exam_name: exam,
      target_date: targetDate,
      self_assessments: assessments as Record<string, SelfAssessment>,
    });
  }, [canSubmit, timeMode, exam, targetDate, assessments]);

  const handleSaveOnly = useCallback(async () => {
    setIsSubmitting(true);
    const result = await saveProfile();
    setIsSubmitting(false);

    if (!result) return;
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Profile saved.", { duration: 3000 });
    }
  }, [saveProfile]);

  const handleSaveAndStart = useCallback(async () => {
    setIsSubmitting(true);

    const result = await saveProfile();

    if (!result) {
      setIsSubmitting(false);
      return;
    }
    if ("error" in result) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    const profileId = result.profile_id;

    try {
      const sessionRes = await fetch(`${TUTOR_ROUTES.API_SESSION_START}?stream=false`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_profile_id: profileId }),
      });

      if (!sessionRes.ok) {
        const errBody = await sessionRes.json().catch(() => null);
        toast.error(errBody?.details || errBody?.error ?? "Failed to start your practice session.");
        setIsSubmitting(false);
        return;
      }

      const sessionData = await sessionRes.json();
      const sessionId = sessionData?.session_id;

      if (!sessionId) {
        toast.error("Session started but no session ID returned.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Your session is ready!", { duration: 2000 });
      router.push(TUTOR_ROUTES.SESSION(sessionId));
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }, [saveProfile, router]);

  const pageTitle = isExisting ? "Update your exam profile" : "Let's set up your prep";
  const pageDescription = isExisting
    ? "Adjust your exam, target date, or self-assessments."
    : "Tell us about your exam and where you stand. We'll handle the rest.";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{pageDescription}</p>
      </div>

      <Card className="w-full">
        <CardContent className="space-y-5 pt-6">
          {/* --- Exam Selection --- */}
          <div className="space-y-2">
            <Label htmlFor="exam-select">What exam are you preparing for?</Label>
            <Select value={exam} onValueChange={handleExamChange}>
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

          {/* --- Date Picker --- */}
          {exam && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="target-date">When is your exam?</Label>
              <input
                id="target-date"
                type="date"
                min={getTodayISO()}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
                  "transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />

              {timeMode && (
                <div className="pt-1">
                  <TimeModeBadge mode={timeMode} />
                </div>
              )}
            </div>
          )}

          {/* --- Self-Assessment --- */}
          {exam && subjects.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <Label className="text-sm font-medium">
                  Rate your current understanding
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
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
                      onChange={(level) => handleAssessmentChange(subject, level)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Actions --- */}
      {exam && subjects.length > 0 && (
        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button
            size="lg"
            className="w-full"
            disabled={!canSubmit}
            onClick={handleSaveAndStart}
          >
            {isSubmitting
              ? "Saving..."
              : isExisting
                ? "Save & Start Practice"
                : "Start My First Session"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={!canSubmit}
            onClick={handleSaveOnly}
          >
            {isExisting ? "Save Changes" : "Save Profile Only"}
          </Button>

          {!allAssessed && targetDate && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Rate all subjects above to continue.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
