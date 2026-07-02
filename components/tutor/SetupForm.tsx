// Path: components/tutor/SetupForm.tsx
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, X, ChevronLeft, ChevronRight, Loader2, Check, Brain } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { getTimeMode } from "@/lib/sm2";
import { TUTOR_ROUTES, TUTOR_CONFIG } from "@/lib/constants/tutor";
import { cn } from "@/lib/utils";
import { createExamProfile } from "@/lib/actions/tutor";
import type { TimeMode, SelfAssessment, SessionIntent } from "@/types/tutor";
import type { ExamProfileInput } from "@/lib/validations/tutor";
import taxonomy from "@/lib/taxonomies.json";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type TaxonomyData = Record<string, Record<string, string[]>>;
const taxonomyData = taxonomy as unknown as TaxonomyData;

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

const STEPS = [
  { id: 1, label: "Reality Anchor" },
  { id: 2, label: "Active Target" },
  { id: 3, label: "The Contract" },
  { id: 4, label: "Diagnostic" },
] as const;

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

function flattenDomains(examName: string): string[] {
  const subjects = taxonomyData[examName];
  if (!subjects) return [];
  const domainSet = new Set<string>();
  for (const domainList of Object.values(subjects)) {
    for (const domain of domainList) {
      domainSet.add(domain);
    }
  }
  return [...domainSet].sort();
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

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
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
                      : "bg-border"
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
                      "border-2 border-border bg-background text-muted-foreground"
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
                    isUpcoming ? "text-muted-foreground" : "text-foreground"
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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SetupFormPrefill {
  exam: string;
  targetDate: string;
  assessments: Record<string, SelfAssessment>;
  isExisting: boolean;
  activeTargets?: string[];
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

  // ---- Step state ----
  const [step, setStep] = useState(1);

  // ---- Form state ----
  const [exam, setExam] = useState<string>(() => {
    if (prefill?.exam) return prefill.exam;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("landingPrefill");
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed.exam ?? "";
        }
      } catch { /* ignore corrupt localStorage */ }
    }
    return "";
  });
  const [targetDate, setTargetDate] = useState<string>(() => {
    if (prefill?.targetDate) return prefill.targetDate;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("landingPrefill");
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed.targetDate ?? "";
        }
      } catch { /* ignore corrupt localStorage */ }
    }
    return "";
  });
  const [assessments, setAssessments] = useState<Record<string, SelfAssessment>>(
    prefill?.assessments ?? {}
  );
  const [activeTargets, setActiveTargets] = useState<string[]>(
    prefill?.activeTargets ?? []
  );
  const [domainSearch, setDomainSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectRef = useRef<HTMLButtonElement>(null);
  const isExisting = prefill?.isExisting ?? false;

  useEffect(() => {
    const timer = setTimeout(() => selectRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  // Consume landing page prefill from localStorage, then clear it
  useEffect(() => {
    try {
      localStorage.removeItem("landingPrefill");
    } catch { /* ignore */ }
  }, []);

  // ---- Derived ----
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

  // ---- Step 1 validity ----
  const step1Valid = exam && targetDate && allAssessed;

  // ---- Step 2: domains ----
  const allDomains = useMemo<string[]>(() => {
    if (!exam) return [];
    return flattenDomains(exam);
  }, [exam]);

  const filteredDomains = useMemo<string[]>(() => {
    const q = domainSearch.trim().toLowerCase();
    if (!q) return allDomains;
    return allDomains.filter((d) => d.toLowerCase().includes(q));
  }, [allDomains, domainSearch]);

  const maxTargetsReached = activeTargets.length >= TUTOR_CONFIG.ACTIVE_TARGET_MAX_TOPICS;
  const step2Valid = activeTargets.length >= 1 && activeTargets.length <= TUTOR_CONFIG.ACTIVE_TARGET_MAX_TOPICS;

  // ---- Handlers ----
  const handleExamChange = useCallback((value: string) => {
    setExam(value);
    setAssessments({});
    setActiveTargets([]);
    setDomainSearch("");
  }, []);

  const handleAssessmentChange = useCallback(
    (subject: string, level: SelfAssessment) => {
      setAssessments((prev) => ({ ...prev, [subject]: level }));
    },
    []
  );

  const toggleDomain = useCallback(
    (domain: string) => {
      setActiveTargets((prev) => {
        if (prev.includes(domain)) {
          return prev.filter((d) => d !== domain);
        }
        if (prev.length >= TUTOR_CONFIG.ACTIVE_TARGET_MAX_TOPICS) {
          return prev;
        }
        return [...prev, domain];
      });
    },
    []
  );

  const removeDomain = useCallback((domain: string) => {
    setActiveTargets((prev) => prev.filter((d) => d !== domain));
  }, []);

  const goToStep = useCallback((nextStep: number) => {
    setStep(nextStep);
  }, []);

  const goBack = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setStep((prev) => Math.min(STEPS.length, prev + 1));
  }, []);

  // ---- Save profile helper ----
  const saveProfile = useCallback(async () => {
    if (!step1Valid || !timeMode) return null;

    return createExamProfile({
      exam_name: exam,
      target_date: targetDate,
      self_assessments: assessments as Record<string, SelfAssessment>,
      active_targets: activeTargets,
    });
  }, [step1Valid, timeMode, exam, targetDate, assessments, activeTargets]);

  // ---- Save only (existing profiles) ----
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

  // ---- Start diagnostic ----
  const handleStartDiagnostic = useCallback(async () => {
    setIsSubmitting(true);
    setStep(4); // Advance to diagnostic step

    const result = await saveProfile();

    if (!result) {
      setIsSubmitting(false);
      setStep(3);
      return;
    }
    if ("error" in result) {
      toast.error(result.error);
      setIsSubmitting(false);
      setStep(3);
      return;
    }

    const profileId = result.profile_id;

    try {
      const sessionRes = await fetch(`${TUTOR_ROUTES.API_SESSION_START}?stream=false`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_profile_id: profileId,
          session_intent: "diagnostic" as SessionIntent,
          question_count: TUTOR_CONFIG.DIAGNOSTIC_QUESTION_COUNT,
        }),
      });

      if (!sessionRes.ok) {
        const errBody = await sessionRes.json().catch(() => null);
        toast.error(errBody?.details ?? errBody?.error ?? "Failed to start your diagnostic session.");
        setIsSubmitting(false);
        setStep(3);
        return;
      }

      const sessionData = await sessionRes.json();
      const sessionId = sessionData?.session_id;

      if (!sessionId) {
        toast.error("Session started but no session ID returned.");
        setIsSubmitting(false);
        setStep(3);
        return;
      }

      toast.success("Your diagnostic session is ready!", { duration: 2000 });
      router.push(TUTOR_ROUTES.SESSION(sessionId));
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
      setStep(3);
    }
  }, [saveProfile, router]);

  // ---- Page metadata ----
  const pageTitle = isExisting ? "Update your exam profile" : "Let's set up your prep";
  const pageDescription = isExisting
    ? "Adjust your exam, target date, or self-assessments."
    : "Tell us about your exam and where you stand. We'll handle the rest.";

  // ---- Render step content ----
  const renderStepContent = () => {
    switch (step) {
      // =====================================================================
      // STEP 1: Reality Anchor
      // =====================================================================
      case 1:
        return (
          <Card className="w-full">
            <CardContent className="space-y-5 pt-6">
              {/* Exam Selection */}
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

              {/* Date Picker */}
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

              {/* Self-Assessment */}
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
        );

      // =====================================================================
      // STEP 2: Active Target
      // =====================================================================
      case 2:
        return (
          <Card className="w-full">
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label className="text-sm font-medium">
                  What are you studying this week?
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select 1–{TUTOR_CONFIG.ACTIVE_TARGET_MAX_TOPICS} topics you are actively working on.
                  This helps us focus your practice on what matters most right now.
                </p>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search topics..."
                  value={domainSearch}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  className="pl-9 pr-8"
                />
                {domainSearch && (
                  <button
                    type="button"
                    onClick={() => setDomainSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Selected chips */}
              {activeTargets.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeTargets.map((domain) => (
                    <Badge
                      key={domain}
                      variant="secondary"
                      className="gap-1 pr-1 cursor-default"
                    >
                      {domain}
                      <button
                        type="button"
                        onClick={() => removeDomain(domain)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                        aria-label={`Remove ${domain}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Domain list */}
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  {filteredDomains.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No topics match your search.
                    </p>
                  ) : (
                    filteredDomains.map((domain) => {
                      const isSelected = activeTargets.includes(domain);
                      const isDisabled = !isSelected && maxTargetsReached;

                      return (
                        <button
                          key={domain}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => toggleDomain(domain)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                            "border-b border-border/30 last:border-b-0",
                            "hover:bg-muted/50",
                            isSelected &&
                              "bg-primary/5 hover:bg-primary/10",
                            isDisabled &&
                              "opacity-40 cursor-not-allowed hover:bg-transparent"
                          )}
                        >
                          {/* Checkbox indicator */}
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span
                            className={cn(
                              "text-left",
                              isSelected && "font-medium text-foreground"
                            )}
                          >
                            {domain}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Selection count hint */}
              <p className="text-xs text-muted-foreground text-center">
                {activeTargets.length === 0
                  ? "Select at least 1 topic to continue."
                  : `${activeTargets.length} of ${TUTOR_CONFIG.ACTIVE_TARGET_MAX_TOPICS} topics selected.`}
              </p>
            </CardContent>
          </Card>
        );

      // =====================================================================
      // STEP 3: The Contract
      // =====================================================================
      case 3:
        return (
          <Card className="w-full">
            <CardContent className="space-y-6 pt-6">
              {/* Brain icon and heading */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">The Forgetting Curve</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Without review, you will forget approximately 70% of what you learn
                    within 6 days.
                  </p>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid gap-3">
                <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium">Why a baseline diagnostic?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We measure what you know right now across every topic. No studying
                    required — just 5 quick questions to map your strengths and gaps.
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium">What happens next?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    After the diagnostic, you will get a personalized dashboard with your
                    readiness index, weak spots, and a daily review plan tuned to your
                    exam date.
                  </p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={handleStartDiagnostic}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating diagnostic...
                    </>
                  ) : (
                    "Start Baseline Diagnostic"
                  )}
                </Button>

                {isExisting && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={handleSaveOnly}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );

      // =====================================================================
      // STEP 4: Diagnostic (creating session)
      // =====================================================================
      case 4:
        return (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center gap-6 py-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Creating your diagnostic</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Generating 5 personalized questions based on your exam profile
                  and active targets. This will only take a moment.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Saving profile and preparing questions...</span>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // ---- Render ----
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col justify-center px-4 py-12">
      {/* Step indicator - hidden on step 4 since it auto-redirects */}
      {step < 4 && (
        <>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{pageDescription}</p>
          </div>

          <StepIndicator currentStep={step} totalSteps={STEPS.length} />
        </>
      )}

      {/* Step content */}
      <div className="animate-in fade-in slide-in-from-right-2 duration-300">
        {renderStepContent()}
      </div>

      {/* Navigation buttons (steps 1-2 only; step 3 has its own CTAs, step 4 is loading) */}
      {(step === 1 || step === 2) && (
        <div className="mt-6 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Back button */}
          {step > 1 ? (
            <Button
              variant="outline"
              size="lg"
              onClick={goBack}
              disabled={isSubmitting}
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div /> /* Spacer to keep Next right-aligned */
          )}

          {/* Next button */}
          <Button
            size="lg"
            onClick={goNext}
            disabled={
              (step === 1 && !step1Valid) ||
              (step === 2 && !step2Valid) ||
              isSubmitting
            }
          >
            Next
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2 validation hint */}
      {step === 2 && !step2Valid && activeTargets.length === 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Select at least 1 topic to continue.
        </p>
      )}

      {/* Step 3 back button (rendered above the card) */}
      {step === 3 && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={goBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        </div>
      )}

      {/* Step 1 validation hint */}
      {step === 1 && !step1Valid && exam && targetDate && !allAssessed && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Rate all subjects above to continue.
        </p>
      )}
    </main>
  );
}
